// src/components/ContactBlock.tsx
import { useEffect, useState } from "react";

/* -------- Types (English-only comments) -------- */
type Email   = { email: string;   caption: string; description: string };
type Discord = { discord: string; caption: string; description: string };
type XHandle = { x: string;       caption: string; description: string };

type Contacts = {
  emails:  Email[];
  discord?: Discord[];
};

type Media = {
  x?: XHandle[];
};

/* each resource item has exactly one dynamic URL field + caption + description */
type ResourceItem = {
  caption: string;
  description: string;
  [k: string]: string; // urlKey -> url
};

type Resources = {
  HJ:  ResourceItem[];
  nft?: ResourceItem[];
};

type JsonData = {
  contacts: Contacts;
  media?: Media;
  resources: Resources;
};

const REMOTE_URL = "https://hashcanon.github.io/resources/res.json";

export const ContactBlock = () => {
  const [data, setData] = useState<JsonData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(REMOTE_URL)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} on ${REMOTE_URL}. Body: ${body.slice(0, 200)}…`);
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  const getUrlKey = (item: ResourceItem) =>
    Object.keys(item).find((k) => k !== "caption" && k !== "description");

  return (
    <section id="contacts" className="space-y-6 mt-10 pb-8">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        Community &amp; Support
      </h2>

      {!data && !err && (
        <p className="text-base leading-relaxed">Loading contacts &amp; resources…</p>
      )}
      {err && (
        <p className="text-base leading-relaxed text-red-500">
          Failed to load resources. Please try again later.
        </p>
      )}
      {data && (
        <>
          {/* RESOURCES */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-center">General Resources</h3>
            <div className="space-y-3 text-base leading-relaxed">
              {data.resources.HJ.map((item, idx) => {
                const urlKey = getUrlKey(item);
                if (!urlKey) return null;
                const url = item[urlKey];
                const key = `${urlKey}:${url}:${idx}`;
                return (
                  <p key={key}>
                    <strong>{item.caption}: </strong>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline hover:text-blue-600"
                    >
                      {url}
                    </a>
                    <br />
                    {item.description}
                  </p>
                );
              })}
            </div>
          </div>

          {/* MEDIA (X/Twitter) */}
          {(data.media?.x?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-center">Media</h3>
              <div className="space-y-3 text-base leading-relaxed">
                {data.media!.x!.map(({ x, caption, description }) => (
                  <p key={x}>
                    <strong>{caption}: </strong>
                    <a
                      href={`https://x.com/${x.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline hover:text-blue-600"
                    >
                      {x}
                    </a>
                    <br />
                    {description}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* CONTACTS */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-center">Contacts</h3>
            <div className="space-y-3 text-base leading-relaxed">
              {data.contacts.emails.map(({ email, caption, description }) => (
                <p key={email}>
                  <strong>{caption}: </strong>
                  <a
                    href={`mailto:${email}`}
                    className="text-blue-400 underline hover:text-blue-600"
                  >
                    {email}
                  </a>
                  <br />
                  {description}
                </p>
              ))}
              {(data.contacts.discord?.length ?? 0) > 0 &&
                data.contacts.discord!.map(({ discord, caption, description }) => (
                  <p key={discord}>
                    <strong>{caption}: </strong>
                    <a
                      href={discord}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline hover:text-blue-600"
                    >
                      {discord}
                    </a>
                    <br />
                    {description}
                  </p>
                ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
