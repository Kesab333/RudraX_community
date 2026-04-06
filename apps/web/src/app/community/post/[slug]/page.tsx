import { CommunityShell } from "@/components/community/community-shell";
import { PostCard } from "@/components/community/post-card";
import { getCommentsForPostId, getPostBySlug } from "@/lib/api";

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <CommunityShell
        title="Post unavailable"
        subtitle="This route is ready, but the backend has not returned a published post for the requested slug."
      >
        <section className="rail-card">
          <h2>No post data</h2>
          <p>Wire /api/v1/posts/slug/:slug and return a published post record for this page.</p>
        </section>
      </CommunityShell>
    );
  }

  const comments = await getCommentsForPostId(post.id);

  return (
    <CommunityShell
      title={post.title}
      subtitle="Persistent, searchable scientific discussion with real-time collaboration hooks."
    >
      <PostCard post={post} />
      <section className="rail-card">
        <h2>Threaded comments</h2>
        {comments.length > 0 ? (
          <div className="comment-list">
            {comments.map((comment) => (
              <article key={comment.id} className="comment-card" style={{ marginLeft: `${comment.depth * 18}px` }}>
                <div className="comment-card__meta">
                  <strong>{comment.author.name}</strong>
                  <span>{comment.author.role}</span>
                </div>
                <p>{comment.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>Wire /api/v1/comments/post/:postId to load threaded comments for this post.</p>
        )}
      </section>
    </CommunityShell>
  );
}
