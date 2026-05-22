'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  ResumeLabels,
  ResumeProject,
  ResumeProjectShowcaseBlock,
} from '@devfolio-blog/shared-types';

type ShowcaseBlockGroup = {
  key: string;
  blocks: ResumeProjectShowcaseBlock[];
};

export function ResumeProjectShowcase({ project, labels }: { project: ResumeProject; labels: ResumeLabels }) {
  const showcase = project.showcase;
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState(showcase?.defaultSectionKey ?? null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const activeSection = useMemo(() => {
    if (!showcase) return null;

    return (
      showcase.sections.find((section) => section.key === activeSectionKey) ??
      showcase.sections.find((section) => section.key === showcase.defaultSectionKey) ??
      showcase.sections[0] ??
      null
    );
  }, [activeSectionKey, showcase]);

  const groupedBlocks = useMemo(() => groupBlocks(activeSection?.blocks ?? []), [activeSection]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
          return;
        }

        setIsOpen(false);
      }
    };

    document.body.classList.add('modal-open');
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, previewImage]);

  if (!showcase) return null;

  return (
    <div className="showcase-entry">
      <button className="button" type="button" onClick={() => setIsOpen(true)}>
        {showcase.entryLabel}
      </button>

      {isOpen ? (
        <div className="showcase-dialog" role="dialog" aria-modal="true" aria-labelledby="showcase-dialog-title">
          <button
            className="showcase-backdrop"
            type="button"
            aria-label="Close showcase"
            onClick={() => setIsOpen(false)}
          />
          <aside className="showcase-panel" aria-live="polite">
            <header className="showcase-panel-header">
              <div>
                <p className="eyebrow">{project.title}</p>
                <h2 id="showcase-dialog-title">{activeSection?.title ?? project.title}</h2>
                {activeSection?.summary ? <p>{activeSection.summary}</p> : null}
              </div>
              <button className="button-muted" type="button" onClick={() => setIsOpen(false)}>
                {showcase.collapseLabel}
              </button>
            </header>

            <nav className="showcase-tabs" aria-label="Showcase sections">
              {showcase.sections.map((section) => (
                <button
                  className={section.key === activeSection?.key ? 'showcase-tab active' : 'showcase-tab'}
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSectionKey(section.key)}
                >
                  {section.title}
                </button>
              ))}
            </nav>

            <div className="showcase-scroll">
              {activeSection ? (
                <>
                  <span className={activeSection.status === 'ready' ? 'status-pill ready' : 'status-pill'}>
                    {activeSection.status === 'ready' ? labels.showcaseReady : labels.showcaseComingSoon}
                  </span>
                  <div className="showcase-groups">
                    {groupedBlocks.map((group) => (
                      <article className="showcase-group" key={group.key}>
                        {group.blocks.map((block, index) => (
                          <section className="showcase-dialog-block" key={`${block.title}-${block.type}`}>
                            {index > 0 ? <div className="showcase-divider" /> : null}
                            <ShowcaseBlock block={block} labels={labels} onPreview={setPreviewImage} />
                          </section>
                        ))}
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </aside>

          {previewImage ? (
            <div className="image-preview" role="dialog" aria-modal="true" aria-label={previewImage.alt}>
              <button
                className="image-preview-backdrop"
                type="button"
                aria-label="Close image preview"
                onClick={() => setPreviewImage(null)}
              />
              <figure>
                <img src={previewImage.src} alt={previewImage.alt} />
                <figcaption>{previewImage.alt}</figcaption>
                <button className="button-muted" type="button" onClick={() => setPreviewImage(null)}>
                  Close
                </button>
              </figure>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ShowcaseBlock({
  block,
  labels,
  onPreview,
}: {
  block: ResumeProjectShowcaseBlock;
  labels: ResumeLabels;
  onPreview: (image: { src: string; alt: string }) => void;
}) {
  const imageAlt = block.imageAlt ?? block.title;

  return (
    <>
      <div className="showcase-block-copy">
        <p className="eyebrow">{block.type}</p>
        <h3>{block.title}</h3>
        {block.body ? <p>{block.body}</p> : null}
      </div>
      {block.imageSrc ? (
        <button className="showcase-image-button" type="button" onClick={() => onPreview({ src: block.imageSrc!, alt: imageAlt })}>
          <img src={block.imageSrc} alt={imageAlt} />
          <span>{labels.openImage}</span>
        </button>
      ) : null}
      {block.caption ? <p className="article-meta">{block.caption}</p> : null}
    </>
  );
}

function groupBlocks(blocks: ResumeProjectShowcaseBlock[]): ShowcaseBlockGroup[] {
  const groups: ShowcaseBlockGroup[] = [];

  for (const block of blocks) {
    const previousGroup = groups[groups.length - 1];

    if (block.groupKey && previousGroup?.key === block.groupKey) {
      previousGroup.blocks.push(block);
      continue;
    }

    groups.push({
      key: block.groupKey ?? `${block.type}-${block.title}`,
      blocks: [block],
    });
  }

  return groups;
}
