import { getString } from "../utils/locale";

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
      const dialogData: { [key: string]: any } = {
        selectedFeature: "summary",
        loadCallback: () => {
          ztoolkit.log("AI Dialog opened");
        },
        unloadCallback: () => {
          ztoolkit.log("AI Dialog closed");
        },
      };

      const dialogHelper = new ztoolkit.Dialog(8, 2)
        .addCell(0, 0, {
          tag: "h2",
          properties: { 
            innerHTML: "🤖 Zotero AI Assistant" 
          },
          styles: {
            textAlign: "center",
            color: "#1a73e8",
            marginBottom: "10px"
          }
        })
        
        .addCell(1, 0, {
          tag: "p",
          properties: {
            innerHTML: "Welcome to Zotero AI! This is where intelligent research features will be available."
          },
          styles: {
            textAlign: "center",
            marginBottom: "15px",
            color: "#333"
          }
        })

        .addCell(2, 0, {
          tag: "div",
          properties: {
            innerHTML: "<strong>🚀 Coming Soon:</strong>"
          },
          styles: {
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#1a73e8"
          }
        })

        .addCell(3, 0, {
          tag: "ul",
          properties: {
            innerHTML: `
              <li>📝 Smart paper summarization</li>
              <li>🏷️ Intelligent tag suggestions</li>  
              <li>🔍 Semantic search across your library</li>
              <li>📊 Research gap analysis</li>
              <li>💡 Research question generation</li>
            `
          },
          styles: {
            marginBottom: "15px",
            paddingLeft: "20px"
          }
        })

        .addCell(4, 0, {
          tag: "div",
          properties: {
            innerHTML: "✨ Select items in your library and use AI features to enhance your research workflow."
          },
          styles: {
            fontStyle: "italic",
            textAlign: "center",
            color: "#666",
            marginBottom: "15px"
          }
        })

        .addCell(5, 0, {
          tag: "div",
          properties: {
            innerHTML: `
              <p><strong>Current Status:</strong> Foundation Ready ✅</p>
              <p><strong>Next Update:</strong> AI Integration 🔄</p>
            `
          },
          styles: {
            backgroundColor: "#f8f9fa",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #e9ecef"
          }
        })

        .addCell(6, 0, {
          tag: "div",
          properties: {
            innerHTML: `
              <small>
                Author: <strong>Maxim Gongalsky</strong><br>
                Version: 0.1.0<br>
                Repository: <a href="https://github.com/mgongalsky/zotero-ai-plugin" target="_blank">GitHub</a>
              </small>
            `
          },
          styles: {
            textAlign: "center",
            color: "#666",
            marginTop: "10px"
          }
        })

        .addButton("Got it!", "confirm")
        .addButton("View Roadmap", "roadmap", {
          noClose: true,
          callback: () => {
            // Open roadmap in browser
            const url = "https://github.com/mgongalsky/zotero-ai-plugin#roadmap";
            ztoolkit.getGlobal("Zotero").launchURL(url);
          }
        })
        .setDialogData(dialogData)
        .open("Zotero AI Assistant", {
          width: 450,
          height: 400,
          centerscreen: true
        });

      return dialogHelper;
    } catch (e) {
      ztoolkit.log("Error showing AI dialog:", e);
      console.error("AI dialog error:", e);
      
      // Fallback to simple alert
      ztoolkit.getGlobal("alert")(
        "🤖 Zotero AI Assistant\n\n" +
        "AI features are coming soon!\n" + 
        "This will include smart summarization, tagging, and more.\n\n" +
        "Author: Maxim Gongalsky"
      );
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