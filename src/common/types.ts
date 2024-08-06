export interface FileToTextConverter {
  convertToText(file: Express.Multer.File): Promise<string>;
}

export type FileType = "pdf" | "image" | "audio";
export const fileTypes = ["pdf", "image", "audio"];

export type FileListView = "list" | "icons" | "recent";

export type PlanType = "basic" | "pro" | "premium" | "none";

export interface IPlan {
  type: PlanType;
  description: string;
  price: number;
  maxStorageInMb: number;
  enableSharedFiles: boolean;
}

export const PLANS: Record<PlanType, IPlan | null> = {
  basic: {
    type: "basic",
    description:
      "Ideal for casual users, the Basic Plan offers essential features for everyday needs, including basic text extraction and summarization services. Get started with a limited number of file uploads and enjoy core functionalities without any additional cost.",
    price: 0,
    maxStorageInMb: 100,
    enableSharedFiles: false,
  },
  pro: {
    type: "pro",
    description:
      "Designed for power users, the Pro Plan provides enhanced capabilities such as shared files, increased file upload limits, faster processing times, and advanced summarization options. Perfect for professionals seeking more robust performance and additional features to streamline their workflow.",
    price: 5,
    maxStorageInMb: 500,
    enableSharedFiles: true,
  },
  premium: {
    type: "premium",
    description:
      "The ultimate package for heavy users and organizations, the Premium Plan includes all the features of the Pro Plan plus priority support, the highest file upload limits, and exclusive access to premium features. Experience the best our service has to offer with maximum efficiency and dedicated assistance.",
    price: 10,
    maxStorageInMb: 1000,
    enableSharedFiles: true,
  },
  none: null,
};

export type Language = "auto" | "english" | "spanish" | "french" | "german" | "chinese" | "japanese" | "korean" | "russian" | "arabic" | "portuguese" | "italian" | "hindi" | "bengali";
