import { ServerResponse } from "http";
import { IncomingMessage } from "http";

type NextFunction = () => void;

export interface DecoratedResponse extends ServerResponse {
  status: (code: number) => DecoratedResponse;
  json: (data: any) => void;
  send: (data: any) => Promise<void>;
  render: (templatePath: string, data: any) => Promise<void>;
}

const ResponseDecorator = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
): void => {

	const customRes: DecoratedResponse = res as DecoratedResponse;

  customRes.status = (status: number): DecoratedResponse => {
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

  };

  next();
};

export default ResponseDecorator;