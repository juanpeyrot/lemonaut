import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export function loadEnvs(modeArg?: string) {
  const root = process.cwd();

	const baseEnv = path.join(root, ".env");
  if (fs.existsSync(baseEnv)) {
    dotenv.config({ path: baseEnv });
  }

	 const mode = modeArg || process.env.NODE_ENV || "development";

  const modeEnv = path.join(root, `.env.${mode}`);
  if (fs.existsSync(modeEnv)) {
    dotenv.config({ path: modeEnv, override: true });
  }
}