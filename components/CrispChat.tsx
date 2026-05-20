"use client"

import Script from "next/script"

const WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? ""

export default function CrispChat() {
  if (!WEBSITE_ID) return null

  return (
    <Script id="crisp-chat" strategy="lazyOnload">
      {`
        window.$crisp=[];
        window.CRISP_WEBSITE_ID="${WEBSITE_ID}";
        (function(){
          var d=document;
          var s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";
          s.async=1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}
    </Script>
  )
}
