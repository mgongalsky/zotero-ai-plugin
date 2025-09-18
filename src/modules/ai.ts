import { getString } from "../utils/locale";
import { config } from "../../package.json";

export class AIModule {
  /**
   * Register AI toolbar button
   */
  static registerAIButton() {
    try {
      ztoolkit.log("Starting AI button registration");
      // Direct DOM manipulation for reliable toolbar button placement
      setTimeout(() => {
        const doc = ztoolkit.getGlobal("window").document;
        
        // Debug: let's find all toolbars
        const allToolbars = doc.querySelectorAll('toolbar');
        ztoolkit.log(`Found ${allToolbars.length} toolbars:`);
        allToolbars.forEach((tb, index) => {
          ztoolkit.log(`Toolbar ${index}: id='${(tb as any).id}', class='${(tb as any).className}'`);
        });
        
        // Prefer the center item tree toolbar, then left collection tree
        let toolbar = doc.getElementById("zotero-toolbar-item-tree") ||
                      doc.getElementById("zotero-toolbar-collection-tree") ||
                      (allToolbars.length ? (allToolbars[0] as Element) : null);
        
        const existing = doc.getElementById("zotero-ai-toolbar-button");
        if (existing) {
          ztoolkit.log("AI button already exists — skipping creation");
          return;
        }
        
        if (toolbar) {
          ztoolkit.log(`Found toolbar with id: ${(toolbar as any).id}`);
          ztoolkit.log("Adding AI button to toolbar (append)");
          
          // Create button using ztoolkit
          const button = ztoolkit.UI.createElement(doc, "toolbarbutton", {
            id: "zotero-ai-toolbar-button",
            attributes: {
              label: "AI",
              tooltiptext: "Zotero AI Assistant",
              class: "zotero-tb-button",
              image: "chrome://zotero/skin/16/universal/lightbulb.png"
            },
            listeners: [
              {
                type: "command",
                listener: () => {
                  this.showAIDialog();
                }
              }
            ]
          });
          
          ;(toolbar as any).appendChild(button);
          ztoolkit.log("AI button appended to toolbar successfully");
          
        } else {
          ztoolkit.log("Toolbar still not found after timeout");
        }
      }, 1000); // Wait 1 second for UI to load
      
    } catch (e) {
      ztoolkit.log("Error adding AI toolbar button:", e);
      console.error("AI button registration error:", e);
    }
  }

  /**
   * Show AI dialog with placeholder content
   */
  static showAIDialog() {
    try {
      const PREFS_PREFIX = config.prefsPrefix;
      const getPref = (key: string) => Zotero.Prefs.get(`${PREFS_PREFIX}.${key}`, true) as string;
      const setPref = (key: string, value: string) => Zotero.Prefs.set(`${PREFS_PREFIX}.${key}`, value, true);

      const savedApiKey = getPref("openai.apiKey") || "";
      const savedModel = getPref("openai.model") || "gpt-5";

      const dialogData: { [key: string]: any } = {
        apiKeyMask: savedApiKey ? "••••-****-****-****" : "",
        model: savedModel,
        prompt: "",
        response: "",
        isLoading: false,
      };

      // Build dialog skeleton (we will attach handlers in loadCallback when DOM is ready)
      let dialogHelper: any;
      dialogData.loadCallback = () => {
        try {
          const win = dialogHelper.window!;
          const doc = win.document;
          const apiInput = doc.getElementById("zotero-ai-api-key") as HTMLInputElement | null;
          const modelInput = doc.getElementById("zotero-ai-model") as HTMLInputElement | null;
          const promptInput = doc.getElementById("zotero-ai-prompt") as HTMLTextAreaElement | null;
          const logArea = doc.getElementById("zotero-ai-log") as HTMLTextAreaElement | null;
          const sendBtn = doc.getElementById("zotero-ai-send") as HTMLButtonElement | null;
          const responseArea = doc.getElementById("zotero-ai-response") as HTMLTextAreaElement | null;

          const prefix = "[ZoteroAI]";
          const log = (msg: string) => {
            const line = `${prefix} ${msg}`;
            const now = new Date().toLocaleTimeString();
            try {
              if (logArea) {
                logArea.value += `[${now}] ${line}\n`;
                logArea.scrollTop = logArea.scrollHeight;
              }
              if (responseArea && !logArea) {
                responseArea.value += `[${now}] ${line}\n`;
                responseArea.scrollTop = responseArea.scrollHeight;
              }
            } catch (_) {}
            try { ztoolkit.log(line); } catch (_) {}
            try { Zotero.debug(line); } catch (_) {}
          };

          log("UI: loadCallback — DOM ready");

          if (!apiInput || !modelInput || !promptInput || !sendBtn || !responseArea) {
            log("ERROR: One or more UI elements not found (api/model/prompt/send/response)");
            return;
          }

          // Prefill fields
          apiInput.value = savedApiKey;
          modelInput.value = savedModel;

          // Click handler
          sendBtn.addEventListener("click", async () => {
            log("Send clicked");
            const apiKey = apiInput.value.trim();
            const model = modelInput.value.trim() || "gpt-5";
            const prompt = promptInput.value.trim();
            if (!apiKey) { win.alert("Please enter your OpenAI API key."); return; }
            if (!prompt) { win.alert("Please enter a prompt."); return; }

            // Save prefs
            try { Zotero.Prefs.set(`${PREFS_PREFIX}.openai.apiKey`, apiKey, true); } catch (_) {}
            try { Zotero.Prefs.set(`${PREFS_PREFIX}.openai.model`, model, true); } catch (_) {}

            if (logArea) logArea.value = "";
            responseArea.value = "";
            const url = "https://api.openai.com/v1/chat/completions";
            const shortKey = apiKey.length > 8 ? `${apiKey.slice(0,3)}…${apiKey.slice(-4)}` : "(hidden)";
            log(`POST ${url}`);
            log(`Headers: content-type=application/json, auth=Bearer ${shortKey}`);
            log(`Body: model=${model}, promptChars=${prompt.length}`);

            const reqId = Math.random().toString(16).slice(2, 8);
            const t0 = Date.now();
            try {
              const answer = await AIModule.askOpenAI(apiKey, model, prompt, (m) => log(`req=${reqId} ${m}`));
              const dt = Date.now() - t0;
              log(`req=${reqId} done in ${dt}ms`);
              responseArea.value += `\n---- answer (req=${reqId}) ----\n` + (answer || "<empty response>");
            } catch (err: any) {
              const dt = Date.now() - t0;
              log(`req=${reqId} ERROR after ${dt}ms: ${err?.message || err}`);
            }
          });
        } catch (e) {
          try { Zotero.debug(`[ZoteroAI] loadCallback error: ${String(e)}`); } catch (_) {}
          try { ztoolkit.log("loadCallback error", e); } catch (_) {}
        }
      };

      dialogHelper = new ztoolkit.Dialog(12, 2)
        .addCell(0, 0, {
          tag: "h2",
          properties: { innerHTML: "🤖 Zotero AI Assistant" },
          styles: { textAlign: "center", color: "#1a73e8", marginBottom: "6px" },
        })
        .addCell(1, 0, { tag: "label", namespace: "html", properties: { innerHTML: "OpenAI API Key:" } })
        .addCell(1, 1, {
          tag: "input",
          namespace: "html",
          id: "zotero-ai-api-key",
          attributes: { type: "password", placeholder: "sk-...", autocomplete: "off" },
          properties: { value: savedApiKey },
        })
        .addCell(2, 0, { tag: "label", namespace: "html", properties: { innerHTML: "Model:" } })
        .addCell(2, 1, {
          tag: "input",
          namespace: "html",
          id: "zotero-ai-model",
          attributes: { type: "text", placeholder: "gpt-4o-mini" },
          properties: { value: savedModel },
        })
        .addCell(3, 0, { tag: "label", namespace: "html", properties: { innerHTML: "Prompt:" } })
        .addCell(3, 1, {
          tag: "textarea",
          namespace: "html",
          id: "zotero-ai-prompt",
          properties: { rows: 6, placeholder: "Ask anything..." },
          styles: { width: "100%" },
        })
        // Logs area (simple console)
        .addCell(4, 0, { tag: "label", namespace: "html", properties: { innerHTML: "Logs:" } })
        .addCell(4, 1, {
          tag: "textarea",
          namespace: "html",
          id: "zotero-ai-log",
          properties: { rows: 8, readOnly: true },
          styles: { width: "100%", backgroundColor: "#f0f0f0" },
        })
        .addCell(5, 1, {
          tag: "button",
          namespace: "html",
          id: "zotero-ai-send",
          properties: { innerHTML: "Send" },
          styles: { padding: "4px 12px", marginTop: "4px" },
        })
        .addCell(6, 0, { tag: "label", namespace: "html", properties: { innerHTML: "Response:" } })
        .addCell(6, 1, {
          tag: "textarea",
          namespace: "html",
          id: "zotero-ai-response",
          properties: { rows: 10, readOnly: true },
          styles: { width: "100%", backgroundColor: "#f7f7f7" },
        })
        .addButton("Close", "close")
        .setDialogData(dialogData)
        .open("Zotero AI Assistant", { width: 560, height: 620, centerscreen: true });


      return dialogHelper;
    } catch (e) {
      ztoolkit.log("Error showing AI dialog:", e);
          // Avoid using console.* in bootstrap context
      ztoolkit.log("AI dialog error:", e);
      try { Zotero.debug(`[ZoteroAI] AI dialog error: ${String(e)}`); } catch (_) {}
      ztoolkit.getGlobal("alert")("Failed to open AI dialog. See Debug Output Logging for details.");
    }
  }

  /**
   * Remove AI button on shutdown
   */
  static unregisterAIButton() {
    try {
      ztoolkit.log("Attempting to remove AI button");
      
      const doc = ztoolkit.getGlobal("window")?.document;
      if (doc) {
        const button = doc.getElementById("zotero-ai-toolbar-button");
        if (button) {
          button.remove();
          ztoolkit.log("AI toolbar button removed successfully");
        } else {
          ztoolkit.log("AI button not found for removal");
        }
      } else {
        ztoolkit.log("Document not available for button removal");
      }
    } catch (e) {
      ztoolkit.log("Error removing AI button:", e);
    }
  }

  /**
   * Call OpenAI Chat Completions API
   */
  static async askOpenAI(apiKey: string, model: string, prompt: string, onProgress?: (msg: string) => void): Promise<string> {
    const url = "https://api.openai.com/v1/chat/completions";
    const payload: any = {
      model,
      messages: [
        { role: "system", content: "You are a helpful research assistant." },
        { role: "user", content: prompt },
      ],
    };
    // Some models (e.g. gpt-5) only allow the default temperature; omit when required
    if (/^gpt-5(\b|[-_:])/i.test(model) || model.toLowerCase() === "gpt-5") {
      onProgress?.("Model requires default temperature; omitting 'temperature' field");
    } else {
      payload.temperature = 0.7;
    }
    onProgress?.("Prepared payload");
    onProgress?.(JSON.stringify(payload).slice(0, 200));

    // Try fetch first, fallback to Zotero.HTTP
    try {
      if (typeof fetch === "function") {
        onProgress?.("Using fetch() - starting request...");
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        onProgress?.(`HTTP ${res.status}`);
        onProgress?.(`Response raw length: ${text.length}`);
        onProgress?.(`Response preview: ${text.slice(0, 200).replace(/\n/g, ' ')}${text.length>200?'…':''}`);
        let data: any;
        try { data = JSON.parse(text); } catch (e) {
          onProgress?.("Failed to parse JSON, returning raw text");
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0,200)}`);
          return text;
        }
        if (!res.ok) {
          const errMsg = data?.error?.message || JSON.stringify(data).slice(0, 200);
          throw new Error(`HTTP ${res.status}: ${errMsg}`);
        }
        const content = data?.choices?.[0]?.message?.content?.trim?.();
        if (!content) onProgress?.("No content field in response; dumping JSON");
        return content ?? JSON.stringify(data, null, 2).slice(0, 4000);
      }
    } catch (e) {
      // fallback below
      ztoolkit.log("fetch failed, using Zotero.HTTP");
      onProgress?.("fetch() path failed; trying Zotero.HTTP.request...");
    }

    onProgress?.("Using Zotero.HTTP.request() - starting request...");
    const resp = await Zotero.HTTP.request("POST", url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const text = (resp as any)?.responseText || (resp as any)?.response;
    onProgress?.(`HTTP ${(resp as any)?.status || "?"}`);
    onProgress?.(`Response raw length: ${String(text||"").length}`);
    onProgress?.(`Response preview: ${String(text||"").slice(0, 200).replace(/\n/g, ' ')}${String(text||"").length>200?'…':''}`);
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      onProgress?.("Failed to parse JSON; returning raw text");
      if ((resp as any)?.status && (resp as any).status >= 400) {
        throw new Error(`HTTP ${(resp as any).status}: ${String(text).slice(0, 200)}`);
      }
      return text;
    }
    if ((resp as any)?.status && (resp as any).status >= 400) {
      throw new Error(data?.error?.message || `HTTP ${ (resp as any).status}`);
    }
    const content = data?.choices?.[0]?.message?.content?.trim?.();
    if (!content) onProgress?.("No content field in response JSON; dumping JSON")
    return content ?? JSON.stringify(data, null, 2).slice(0, 4000);
  }

  /**
   * Get selected items for AI processing
   */
  static getSelectedItems(): Zotero.Item[] {
    try {
      const zoteroPane = ztoolkit.getGlobal("ZoteroPane");
      return zoteroPane.getSelectedItems();
    } catch (e) {
      ztoolkit.log("Error getting selected items:", e);
      return [];
    }
  }
}
