import SupportRequest from "./support.model"
import { AppError } from "../../middlewares/error.middleware"
import { Types } from "mongoose"

export const createSupportRequest = async (requestData: any) => {
  return await SupportRequest.create(requestData)
}

export const getUserSupportRequests = async (userId: string) => {
  return await SupportRequest.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 })
}

export const getSupportRequestById = async (requestId: string, userId: string) => {
  const request = await SupportRequest.findOne({
    _id: requestId,
    user: new Types.ObjectId(userId),
  })

  if (!request) {
    throw new AppError("Support request not found", 404)
  }

  return request
}

export const getFAQs = async (category?: string) => {
  const faqs = [
    {
      id: "1",
      question: "How do I reset my password?",
      answer:
        "Go to the login page, click 'Forgot Password', enter your email, and follow the instructions sent to your email. The reset code is valid for 15 minutes.",
      category: "account",
    },
    {
      id: "2",
      question: "What is the storage limit?",
      answer:
        "The default storage limit is 15GB. You can check your current usage in the Storage section of your dashboard. Storage includes all files, images, PDFs, and notes.",
      category: "billing",
    },
    {
      id: "3",
      question: "How do I create a private folder?",
      answer:
        "When creating or editing a folder, toggle the 'Private' switch. You'll need to set a PIN first if you haven't already. Private folders require PIN verification to access.",
      category: "features",
    },
    {
      id: "4",
      question: "How do I upload files?",
      answer:
        "Navigate to the Files section and click the upload button. You can upload images (up to 10MB) and PDFs (up to 50MB). You can also create text notes directly in the app.",
      category: "features",
    },
    {
      id: "5",
      question: "Can I organize files into folders?",
      answer:
        "Yes! Create folders from the Folders section and when uploading files, select which folder to place them in. You can also move files between folders later.",
      category: "features",
    },
    {
      id: "6",
      question: "What file types are supported?",
      answer:
        "Jotter supports images (JPEG, PNG, GIF, WEBP), PDFs, and text notes. Image files can be up to 10MB and PDFs up to 50MB.",
      category: "features",
    },
    {
      id: "7",
      question: "How do I search for files?",
      answer:
        "Use the search bar at the top to search across all your files and folders. You can search by filename, tags, or folder names. Use tags to better organize and find your content.",
      category: "features",
    },
    {
      id: "8",
      question: "Is my data secure?",
      answer:
        "Yes! All data is encrypted in transit and at rest. You can also set a PIN to protect private folders. We never share your data with third parties.",
      category: "account",
    },
    {
      id: "9",
      question: "How do I delete my account?",
      answer:
        "Go to Settings > Account and scroll to the bottom. Click 'Delete Account' and confirm. This action is permanent and will delete all your files and data.",
      category: "account",
    },
    {
      id: "10",
      question: "What happens when I reach my storage limit?",
      answer:
        "When you reach your storage limit, you won't be able to upload new files. You'll receive warnings at 80%, 90%, and 95% usage. Delete unused files to free up space.",
      category: "billing",
    },
  ]

  if (category) {
    return faqs.filter((faq) => faq.category === category)
  }
  return faqs
}
