import Queue from "bull";
import FileService from "../services/FileService";
import { FileType } from "../common/types";

interface FileProcessingJob {
  file: Express.Multer.File;
  userId: string;
  fileName: string;
  type: FileType;
}

const fileProcessingQueue = new Queue<FileProcessingJob>("file processing", {
  redis: { host: "127.0.0.1", port: 6379 },
});

fileProcessingQueue.process(async (job, done) => {
  try {
    const { file, userId, fileName, type } = job.data;
    await FileService.processFile(file, userId, fileName, type);
    done();
  } catch (error) {
    done(error);
  }
});

export default fileProcessingQueue;
