import { CommunityShell } from "@/components/community/community-shell";
import { ComposeForm } from "@/components/community/compose-form";
import { getShareDraft } from "@/lib/api";

export default async function SharedComposePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const draft = await getShareDraft(token);

  if (!draft) {
    return (
      <CommunityShell
        title="Share to Community"
        subtitle="This route is ready for imported drafts, but no live share payload was returned."
      >
        <section className="rail-card">
          <h2>Shared draft unavailable</h2>
          <p>Wire /api/v1/integrations/share/:token so PhysicX, ChemistrY, and MathematicX can prefill this editor.</p>
        </section>
      </CommunityShell>
    );
  }

  return (
    <CommunityShell
      title="Share to Community"
      subtitle={`Imported from ${draft.sourceProduct}. Review the prefilled content and publish manually.`}
    >
      <ComposeForm
        heading="Prefilled collaboration draft"
        description="The integration has created a draft shell. Edit the content, verify the category and tags, then publish when ready."
        prefill={{
          title: draft.title,
          content: draft.content,
          category: draft.category,
          postType: draft.postType,
          tags: draft.tags,
        }}
      />
    </CommunityShell>
  );
}
