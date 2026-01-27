import { type CollectionEntry, getCollection } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export const isPublished = (post: BlogPost) => !post.data.draft;

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.filter(isPublished);
}
