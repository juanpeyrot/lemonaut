import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadEnvs } from "../../src/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

vi.mock("dotenv");
vi.mock("fs");
vi.mock("path");

describe("loadEnvs", () => {
  const mockExistsSync = vi.fn();
  const mockConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(fs, "existsSync").mockImplementation(mockExistsSync);
    vi.spyOn(dotenv, "config").mockImplementation(mockConfig);
    vi.spyOn(path, "join").mockImplementation((...args) => args.join("/"));

    vi.spyOn(process, "cwd").mockReturnValue("/project-root");
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("should load base .env file if exists", () => {
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env"
    );

    loadEnvs();

    expect(fs.existsSync).toHaveBeenCalledWith("/project-root/.env");
    expect(dotenv.config).toHaveBeenCalledWith({
      path: "/project-root/.env",
    });
  });

  it("should load mode-specific env file if exists", () => {
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env.test"
    );

    loadEnvs("test");

    expect(fs.existsSync).toHaveBeenCalledWith("/project-root/.env.test");
    expect(dotenv.config).toHaveBeenCalledWith({
      path: "/project-root/.env.test",
      override: true,
    });
  });

  it("should use development as default mode when no args provided", () => {
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env.development"
    );

    loadEnvs();

    expect(fs.existsSync).toHaveBeenCalledWith(
      "/project-root/.env.development"
    );
  });

  it("should use NODE_ENV when no mode arg provided", () => {
    process.env.NODE_ENV = "staging";
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env.staging"
    );

    loadEnvs();

    expect(fs.existsSync).toHaveBeenCalledWith("/project-root/.env.staging");
  });

  it("should prioritize modeArg over NODE_ENV", () => {
    process.env.NODE_ENV = "staging";
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env.production"
    );

    loadEnvs("production");

    expect(fs.existsSync).toHaveBeenCalledWith("/project-root/.env.production");
    expect(fs.existsSync).not.toHaveBeenCalledWith(
      "/project-root/.env.staging"
    );
  });

  it("should use override for mode-specific env files", () => {
    mockExistsSync.mockImplementation(
      (filePath) => filePath === "/project-root/.env.test"
    );

    loadEnvs("test");

    expect(dotenv.config).toHaveBeenCalledWith({
      path: "/project-root/.env.test",
      override: true,
    });
  });

  it("should not call dotenv.config if no env files exist", () => {
    mockExistsSync.mockReturnValue(false);

    loadEnvs();

    expect(dotenv.config).not.toHaveBeenCalled();
  });
});
