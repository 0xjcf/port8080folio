import { type CollectionEntry, getCollection } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

export type BlogPost = BlogEntry & {
  slug: string;
};

export const isPublished = (post: BlogPost) => !post.data.draft;

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ ...post, slug: post.id })).filter(isPublished);
}
