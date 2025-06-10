import { ServerResponse } from "http";
import { IncomingMessage } from "http";
import ejs from "ejs";
import path from "path";
import { NextFunction } from "../types";

export interface Response extends ServerResponse {
  status: (code: number) => Response;
  json: (data: any) => void;
  send: (data: any) => Promise<void>;
  render: (templatePath: string, data: any) => Promise<void>;
}

const ResponseDecorator = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
): void => {
  const customRes: Response = res as Response;

  customRes.status = (status: number): Response => {
    customRes.statusCode = status;
    return customRes;
  };

  customRes.json = (data: any): void => {
    customRes.setHeader("Content-Type", "application/json");
    customRes.end(JSON.stringify(data));
  };

  customRes.send = async (data: any): Promise<void> => {
    customRes.end(data);
  };

  customRes.render = async (templatePath: string, data: any): Promise<void> => {
    try {
      const fullPath = path.join(process.cwd(), "views", templatePath);
      const html = await ejs.renderFile(fullPath, data, { async: true });
      customRes.setHeader("Content-Type", "text/html");
      customRes.end(html);
    } catch (err) {
      customRes.statusCode = 500;
      customRes.end("Template rendering error");
    }
  };

  next();
};

export default ResponseDecorator;