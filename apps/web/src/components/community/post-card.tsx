import Link from "next/link";
import type { CommunityPostSummary } from "@rudrax/shared";

const categoryLabels: Record<string, string> = {
  physics: "Physics",
  chemistry: "Chemistry",
  mathematics: "Mathematics",
  simulations: "Simulations",
  research: "Research",
  projects: "Projects",
  general: "General",
  announcements: "Announcements",
  support: "Support",
};

export function PostCard({ post }: { post: CommunityPostSummary }) {
  return (
    <article className="post-card">
      <div className="post-card__meta">
        <div>
          <div className="post-card__author">{post.author.name}</div>
          <div className="post-card__submeta">
            <span>{post.author.role}</span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <span className={`post-card__category cat-${post.category}`}>
          {categoryLabels[post.category] ?? post.category}
        </span>
      </div>
      <div className="post-card__body">
        <Link href={`/community/post/${post.slug}`} className="post-card__title">
          {post.title}
        </Link>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <div className="post-card__tags">
          {post.tags.map((tag) => (
            <span key={tag} className="post-card__tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="post-card__footer">
        <span>{post.type}</span>
        <span>{post.likeCount} likes</span>
        <span>{post.commentCount} comments</span>
      </div>
    </article>
  );
}
