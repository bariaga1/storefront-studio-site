import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { folderNameFor } from "./inquiry";

export type ClientFiles = Record<string, string>;

export type PersistResult = {
  folder: string;
  local: boolean;
  github: boolean;
};

type GithubConfig = {
  token: string;
  repo: string;
  branch: string;
};

function clientsRoot(): string {
  return path.join(process.cwd(), "clients");
}

async function folderExistsLocally(name: string): Promise<boolean> {
  try {
    await stat(path.join(clientsRoot(), name));
    return true;
  } catch {
    return false;
  }
}

export async function allocateFolder(businessName: string): Promise<string> {
  const base = folderNameFor(businessName);
  if (!(await folderExistsLocally(base))) {
    return base;
  }

  for (let i = 2; i < 50; i += 1) {
    const candidate = `${base}-${i}`;
    if (!(await folderExistsLocally(candidate))) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

export async function writeLocalFolder(
  folder: string,
  files: ClientFiles,
): Promise<void> {
  const dir = path.join(clientsRoot(), folder);
  await mkdir(dir, { recursive: true });
  await Promise.all(
    Object.entries(files).map(([name, contents]) =>
      writeFile(path.join(dir, name), contents, "utf8"),
    ),
  );
}

function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) {
    return null;
  }
  return { token, repo, branch };
}

export function githubConfigured(): boolean {
  return githubConfig() !== null;
}

async function githubJson(
  config: GithubConfig,
  pathname: string,
  init?: RequestInit,
) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub ${response.status} ${pathname}: ${text}`);
  }
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

export async function writeGithubFolder(
  folder: string,
  files: ClientFiles,
): Promise<void> {
  const config = githubConfig();
  if (!config) {
    throw new Error("GitHub is not configured.");
  }

  const ref = await githubJson(
    config,
    `/repos/${config.repo}/git/ref/heads/${config.branch}`,
  );
  const object = ref.object as { sha: string };
  const commit = await githubJson(
    config,
    `/repos/${config.repo}/git/commits/${object.sha}`,
  );
  const baseTree = commit.tree as { sha: string };

  const tree = await githubJson(config, `/repos/${config.repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTree.sha,
      tree: Object.entries(files).map(([name, contents]) => ({
        path: `clients/${folder}/${name}`,
        mode: "100644",
        type: "blob",
        content: contents,
      })),
    }),
  });

  const newCommit = await githubJson(config, `/repos/${config.repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `Add inquiry for ${folder}`,
      tree: (tree as { sha: string }).sha,
      parents: [object.sha],
    }),
  });

  await githubJson(
    config,
    `/repos/${config.repo}/git/refs/heads/${config.branch}`,
    {
      method: "PATCH",
      body: JSON.stringify({ sha: (newCommit as { sha: string }).sha }),
    },
  );
}

export async function persistClientFolder(
  businessName: string,
  filesFor: (folder: string) => ClientFiles,
): Promise<PersistResult> {
  const folder = await allocateFolder(businessName);
  const files = filesFor(folder);
  const result: PersistResult = { folder, local: false, github: false };

  try {
    await writeLocalFolder(folder, files);
    result.local = true;
  } catch (error) {
    console.warn("Local client folder write failed:", error);
  }

  if (githubConfigured()) {
    try {
      await writeGithubFolder(folder, files);
      result.github = true;
    } catch (error) {
      console.error("GitHub client folder write failed:", error);
    }
  }

  return result;
}
