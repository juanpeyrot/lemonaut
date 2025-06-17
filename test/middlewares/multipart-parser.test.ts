import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { Readable } from "stream";
import Busboy from "busboy";
import { IncomingMessage } from "http";
import { Multipart, MultipartFile, RequestWithFiles } from "../../src/middlewares/multipart-parser";

vi.mock("busboy", () => {
  return {
    default: vi.fn(),
  };
});

describe("multipart middleware", () => {
  let busboyOnCallbacks: Record<string, Function[]> = {};
  let busboyInstanceMock: any;

  beforeEach(() => {
    busboyOnCallbacks = {};
    busboyInstanceMock = {
      on: (event: string, cb: Function) => {
        if (!busboyOnCallbacks[event]) busboyOnCallbacks[event] = [];
        busboyOnCallbacks[event].push(cb);
        return busboyInstanceMock;
      },
      end: vi.fn(),
    };
    (Busboy as unknown as Mock).mockImplementation(() => busboyInstanceMock);
  });

  it("calls next immediately if content-type is not multipart/form-data", () => {
    const req = {
      headers: { "content-type": "application/json" },
      pipe: vi.fn(),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    Multipart(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(Busboy).not.toHaveBeenCalled();
  });

  it("processes fields and files, assigns to req, calls next on finish", () => {
    const req = Object.assign({
      headers: { "content-type": "multipart/form-data; boundary=---" },
      pipe: vi.fn(),
    }) as RequestWithFiles;

    const res = {} as any;
    const next = vi.fn();

    Multipart(req, res, next);

    expect(Busboy).toHaveBeenCalledWith({ headers: req.headers });
    expect(req.pipe).toHaveBeenCalledWith(busboyInstanceMock);

    busboyOnCallbacks["field"].forEach((cb) => cb("username", "alice"));

    const fakeFileStream = new Readable({
      read() {
        this.push(Buffer.from("filecontent"));
        this.push(null);
      },
    });

    const fileInfo = {
      filename: "test.txt",
      encoding: "7bit",
      mimeType: "text/plain",
    };

    busboyOnCallbacks["file"].forEach((cb) =>
      cb("avatar", fakeFileStream, fileInfo)
    );

    return new Promise<void>((resolve) => {
      fakeFileStream.on("end", () => {
        busboyOnCallbacks["finish"].forEach((cb) => cb());

        expect(req.body).toEqual({ username: "alice" });
        expect(req.files).toHaveLength(1);

        const file = req.files![0] as MultipartFile;
        expect(file.fieldname).toBe("avatar");
        expect(file.filename).toBe("test.txt");
        expect(file.mime).toBe("text/plain");
        expect(file.buffer.toString()).toBe("filecontent");

        expect(next).toHaveBeenCalledOnce();

        resolve();
      });
    });
  });

  it("handles busboy error event", () => {
    const req = Object.assign(new IncomingMessage(null as any), {
      headers: { "content-type": "multipart/form-data; boundary=---" },
      pipe: vi.fn(),
    }) as RequestWithFiles;

    const res = {
      statusCode: 0,
      end: vi.fn(),
    } as any;
    const next = vi.fn();

    Multipart(req, res, next);

    const error = new Error("Test error");
    busboyOnCallbacks["error"].forEach((cb) => cb(error));

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith("Error processing file upload");
  });
});
