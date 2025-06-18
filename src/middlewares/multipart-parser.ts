import { IncomingMessage } from "http";
import { Middleware } from "../types/index.js";
import { Readable } from "stream";
import Busboy from "busboy";

export interface MultipartFile {
  fieldname: string;
  filename: string;
  mime: string;
  buffer: Buffer;
}

export interface RequestWithFiles extends IncomingMessage {
  body?: Record<string, any>;
  files?: MultipartFile[];
}

export const Multipart: Middleware = (
  req,
  res,
  next,
) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.startsWith("multipart/form-data")) {
    return next();
  }

  const reqWithFiles = req as RequestWithFiles;
  const busboy = Busboy({ headers: req.headers });

  const fields: Record<string, any> = {};
  const files: MultipartFile[] = [];

  busboy.on("field", (fieldname: string, val: string) => {
    fields[fieldname] = val;
  });

  busboy.on(
    "file",
    (
      fieldname: string,
      fileStream: Readable,
      info: { filename: string; encoding: string; mimeType: string }
    ) => {
      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];

      fileStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      fileStream.on("end", () => {
        files.push({
          fieldname,
          filename,
          mime: mimeType,
          buffer: Buffer.concat(chunks),
        });
      });

      fileStream.on("error", (err) => {
        console.error("Error reading file stream", err);
      });
    }
  );

  busboy.on("error", (err: Error) => {
    console.error("Busboy error:", err);
    res.statusCode = 500;
    res.end("Error processing file upload");
  });

  busboy.on("finish", () => {
    reqWithFiles.body = fields;
    reqWithFiles.files = files;
    next();
  });

  req.pipe(busboy);
};
