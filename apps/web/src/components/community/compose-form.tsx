"use client";

import { useState } from "react";
import { CATEGORIES, POST_TYPES } from "@rudrax/shared";

interface ComposeFormProps {
  heading: string;
  description: string;
  prefill?: {
    title?: string | null;
    content?: string;
    category?: string;
    postType?: string;
    tags?: string[];
  };
}

export function ComposeForm({ heading, description, prefill }: ComposeFormProps) {
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [content, setContent] = useState(prefill?.content ?? "");
  const [category, setCategory] = useState(prefill?.category ?? "physics");
  const [postType, setPostType] = useState(prefill?.postType ?? "discussion");
  const [tags, setTags] = useState(prefill?.tags?.join(", ") ?? "");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    setStatus("Submitting...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000"}/api/v1/posts`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            title,
            content,
            category,
            type: postType,
            visibility: "draft",
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          }),
        },
      );

      if (!response.ok) {
        setStatus("Draft endpoint is ready, but the API is not reachable in this environment.");
        return;
      }

      setStatus("Draft saved successfully.");
    } catch {
      setStatus("Draft endpoint is wired. Run the API locally to persist the post.");
    }
  };

  return (
    <section className="compose-card">
      <div className="section-heading">
        <h1>{heading}</h1>
        <p>{description}</p>
      </div>
      <label className="field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" />
      </label>
      <label className="field">
        <span>Category</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Post type</span>
        <select value={postType} onChange={(event) => setPostType(event.target.value)}>
          {POST_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Tags</span>
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="quantum, simulation" />
      </label>
      <label className="field">
        <span>Content</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write the post content, methods, or context here."
          rows={10}
        />
      </label>
      <button type="button" className="primary-button" onClick={submit}>
        Save draft
      </button>
      {status ? <p className="helper-text">{status}</p> : null}
    </section>
  );
}
