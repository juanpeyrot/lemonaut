import { ServerResponse, IncomingMessage } from "http";
import { Middleware, NextFunction } from "../types";
import ejs from "ejs";
import path from "path";

export interface IResponse extends ServerResponse<IncomingMessage> {
  status: (code: number) => IResponse;
  json: (data: any) => void;
  send: (data: any) => Promise<void>;
  render: (templatePath: string, data: any) => Promise<void>;
}

export const Response: Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
): void => {
  const customRes = res as IResponse;

  customRes.status = (code: number): IResponse => {
    customRes.statusCode = code;
    return customRes;
  };

  customRes.json = (data: any): void => {
		if (customRes.writableEnded) return;
    customRes.setHeader("Content-Type", "application/json");
    customRes.end(JSON.stringify(data));
  };

  customRes.send = async (data: any): Promise<void> => {
		if (customRes.writableEnded) return;
    customRes.end(data);
  };

  customRes.render = async (templatePath: string, data: any): Promise<void> => {
		if (customRes.writableEnded) return;
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