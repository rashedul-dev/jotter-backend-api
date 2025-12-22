import File from "../files/file.model"
import Folder from "../folders/folder.model"
import { Types } from "mongoose"

export const performGlobalSearch = async (userId: string, searchTerm: string, type?: string) => {
  const userObjectId = new Types.ObjectId(userId)
  const textSearch = { $text: { $search: searchTerm } }
  const ownerQuery = { owner: userObjectId }

  let files: any[] = []
  let folders: any[] = []

  if (!type || type === "files" || type === "all") {
    // Try text search first
    files = await File.find({ ...ownerQuery, ...textSearch }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(50)

    // Fallback to regex if no text results
    if (files.length === 0) {
      files = await File.find({
        owner: userObjectId,
        $or: [{ title: { $regex: searchTerm, $options: "i" } }, { tags: { $in: [new RegExp(searchTerm, "i")] } }],
      })
        .sort({ createdAt: -1 })
        .limit(50)
    }
  }

  if (!type || type === "folders" || type === "all") {
    // Try text search first
    folders = await Folder.find({ ...ownerQuery, ...textSearch }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(50)

    // Fallback to regex
    if (folders.length === 0) {
      folders = await Folder.find({
        owner: userObjectId,
        name: { $regex: searchTerm, $options: "i" },
      })
        .sort({ name: 1 })
        .limit(50)
    }
  }

  return { files, folders }
}

export const searchByTag = async (userId: string, tag: string) => {
  const userObjectId = new Types.ObjectId(userId)

  return await File.find({
    owner: userObjectId,
    tags: { $in: [new RegExp(`^${tag}$`, "i")] },
  }).sort({ createdAt: -1 })
}

export const getPopularTags = async (userId: string, limit = 10) => {
  const userObjectId = new Types.ObjectId(userId)

  const tags = await File.aggregate([
    { $match: { owner: userObjectId } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ])

  return tags.map((t) => ({ tag: t._id, count: t.count }))
}
