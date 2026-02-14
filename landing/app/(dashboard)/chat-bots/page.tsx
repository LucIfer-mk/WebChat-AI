"use client";

import { useState, useEffect, useRef } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Bot,
  Plus,
  Code,
  Trash2,
  Upload,
  Copy,
  Check,
  X,
  Settings,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import styles from "./chatbots.module.css";

const API_URL = "http://localhost:8000";

interface Chatbot {
  id: string;
  name: string;
  welcome_message: string;
  primary_color: string;
  header_color: string;
  bubble_color: string;
  text_color: string;
  icon_url: string | null;
  position: string;
  created_at: string;
}

interface KnowledgeEntry {
  id: string;
  chatbot_id: string;
  trigger: string;
  response: string;
  is_exact_match: boolean;
  created_at: string;
}

export default function ChatBotsPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState<string | null>(null);
  const [editingBot, setEditingBot] = useState<Chatbot | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState("");

  // Edit modal tabs: "settings" | "knowledge"
  const [editTab, setEditTab] = useState<"settings" | "knowledge">("settings");

  // Knowledge base
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(
    [],
  );
  const [kbTrigger, setKbTrigger] = useState("");
  const [kbResponse, setKbResponse] = useState("");
  const [kbExact, setKbExact] = useState(false);
  const [kbSaving, setKbSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    welcome_message: "Hi! How can I help you today?",
    primary_color: "#4361EE",
    header_color: "#0A1929",
    bubble_color: "#4361EE",
    text_color: "#FFFFFF",
    position: "bottom-right",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    try {
      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
      const res = await fetch(`${API_URL}/api/chatbots?user_id=${userId}`);
      const data = await res.json();
      setBots(data);
    } catch (err) {
      console.error("Failed to fetch bots:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
      const res = await fetch(`${API_URL}/api/chatbots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: userId }),
      });
      const bot = await res.json();
      if (iconFile) {
        const fd = new FormData();
        fd.append("icon", iconFile);
        await fetch(`${API_URL}/api/chatbots/${bot.id}/icon`, {
          method: "POST",
          body: fd,
        });
      }
      await fetchBots();
      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create bot:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingBot || !formData.name.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/chatbots/${editingBot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (iconFile) {
        const fd = new FormData();
        fd.append("icon", iconFile);
        await fetch(`${API_URL}/api/chatbots/${editingBot.id}/icon`, {
          method: "POST",
          body: fd,
        });
      }
      await fetchBots();
      setEditingBot(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update bot:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;
    try {
      await fetch(`${API_URL}/api/chatbots/${id}`, { method: "DELETE" });
      setBots(bots.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bot:", err);
    }
  }

  async function handleEmbed(id: string) {
    try {
      const res = await fetch(`${API_URL}/api/chatbots/${id}/embed`);
      const data = await res.json();
      setEmbedCode(data.script_tag);
      setShowEmbedModal(id);
    } catch (err) {
      console.error("Failed to get embed code:", err);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openEditModal(bot: Chatbot) {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      welcome_message: bot.welcome_message,
      primary_color: bot.primary_color,
      header_color: bot.header_color,
      bubble_color: bot.bubble_color,
      text_color: bot.text_color,
      position: bot.position,
    });
    setIconFile(null);
    setIconPreview(bot.icon_url || null);
    setEditTab("settings");
    fetchKnowledge(bot.id);
  }

  function closeEditModal() {
    setEditingBot(null);
    resetForm();
  }

  function resetForm() {
    setFormData({
      name: "",
      welcome_message: "Hi! How can I help you today?",
      primary_color: "#4361EE",
      header_color: "#0A1929",
      bubble_color: "#4361EE",
      text_color: "#FFFFFF",
      position: "bottom-right",
    });
    setIconFile(null);
    setIconPreview(null);
  }

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // ── Knowledge Base ──
  async function fetchKnowledge(botId: string) {
    try {
      const res = await fetch(`${API_URL}/api/chatbots/${botId}/knowledge`);
      const data = await res.json();
      setKnowledgeEntries(data);
    } catch (err) {
      console.error("Failed to fetch knowledge:", err);
    }
  }

  async function handleAddKnowledge() {
    if (!editingBot || !kbTrigger.trim() || !kbResponse.trim()) return;
    setKbSaving(true);
    try {
      await fetch(`${API_URL}/api/chatbots/${editingBot.id}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: kbTrigger,
          response: kbResponse,
          is_exact_match: kbExact,
        }),
      });
      setKbTrigger("");
      setKbResponse("");
      setKbExact(false);
      await fetchKnowledge(editingBot.id);
    } catch (err) {
      console.error("Failed to add knowledge:", err);
    } finally {
      setKbSaving(false);
    }
  }

  async function handleDeleteKnowledge(entryId: string) {
    if (!editingBot) return;
    try {
      await fetch(
        `${API_URL}/api/chatbots/${editingBot.id}/knowledge/${entryId}`,
        {
          method: "DELETE",
        },
      );
      setKnowledgeEntries(knowledgeEntries.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error("Failed to delete knowledge:", err);
    }
  }

  const embedBot = bots.find((b) => b.id === showEmbedModal);

  if (loading) {
    return (
      <div className={styles.chatbotsPage}>
        <DashboardHeader title="Chat Bots" />
        <div className={styles.content}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading your chatbots...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatbotsPage}>
      <DashboardHeader title="Chat Bots" />

      <div className={styles.content}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h2>
            {bots.length} Chatbot{bots.length !== 1 ? "s" : ""}
          </h2>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Chatbot
          </button>
        </div>

        {/* Bot Cards or Empty State */}
        {bots.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Bot size={36} />
            </div>
            <h3>No Chatbots Yet</h3>
            <p>
              Create your first AI chatbot and embed it on any website with a
              single script tag.
            </p>
          </div>
        ) : (
          <div className={styles.botsGrid}>
            {bots.map((bot) => (
              <div key={bot.id} className={styles.botCard}>
                <div className={styles.botCardHeader}>
                  {bot.icon_url ? (
                    <img
                      src={bot.icon_url}
                      alt={bot.name}
                      className={styles.botIcon}
                    />
                  ) : (
                    <div
                      className={styles.botIconPlaceholder}
                      style={{ background: bot.primary_color }}
                    >
                      {bot.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={styles.botName}>{bot.name}</div>
                    <div className={styles.botSub}>
                      Created {new Date(bot.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className={styles.colorDots}>
                  <div
                    className={styles.colorDot}
                    style={{ background: bot.primary_color }}
                    title="Primary"
                  />
                  <div
                    className={styles.colorDot}
                    style={{ background: bot.header_color }}
                    title="Header"
                  />
                  <div
                    className={styles.colorDot}
                    style={{ background: bot.bubble_color }}
                    title="Bubble"
                  />
                </div>

                <div className={styles.botActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(bot)}
                  >
                    <Settings size={14} style={{ marginRight: 4 }} />
                    Edit
                  </button>
                  <button
                    className={styles.embedBtn}
                    onClick={() => handleEmbed(bot.id)}
                  >
                    <Code size={14} style={{ marginRight: 4 }} />
                    Embed
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(bot.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════ CREATE MODAL ═══════════════ */}
      {showCreateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Chatbot</h2>
              <button
                className={styles.closeModal}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {renderSettingsForm()}
              {renderPreview()}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleCreate}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? "Creating..." : "Create Chatbot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      {editingBot && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div
            className={styles.modalWide}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Edit: {editingBot.name}</h2>
              <button className={styles.closeModal} onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabBar}>
              <button
                className={`${styles.tab} ${editTab === "settings" ? styles.tabActive : ""}`}
                onClick={() => setEditTab("settings")}
              >
                <Settings size={16} /> Settings
              </button>
              <button
                className={`${styles.tab} ${editTab === "knowledge" ? styles.tabActive : ""}`}
                onClick={() => setEditTab("knowledge")}
              >
                <BookOpen size={16} /> Knowledge Base
              </button>
            </div>

            <div className={styles.modalBody}>
              {editTab === "settings" && (
                <>
                  {renderSettingsForm()}
                  {renderPreview()}
                </>
              )}

              {editTab === "knowledge" && (
                <div className={styles.knowledgeSection}>
                  <div className={styles.kbInfo}>
                    <BookOpen size={20} color="var(--secondary)" />
                    <div>
                      <h4>Custom Responses</h4>
                      <p>
                        Add trigger words/phrases and their responses. When a
                        visitor types a message containing the trigger, your bot
                        will reply with the custom response.
                      </p>
                    </div>
                  </div>

                  {/* Add new entry */}
                  <div className={styles.kbForm}>
                    <div className={styles.kbFormRow}>
                      <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label>Trigger Word / Phrase</label>
                        <input
                          type="text"
                          placeholder='e.g. "pricing", "hello", "refund"'
                          value={kbTrigger}
                          onChange={(e) => setKbTrigger(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Bot Response</label>
                      <textarea
                        placeholder="The response the bot should give when the trigger is matched..."
                        value={kbResponse}
                        onChange={(e) => setKbResponse(e.target.value)}
                      />
                    </div>
                    <div className={styles.kbFormActions}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={kbExact}
                          onChange={(e) => setKbExact(e.target.checked)}
                        />
                        <span>Exact match only</span>
                      </label>
                      <button
                        className={styles.addKbBtn}
                        onClick={handleAddKnowledge}
                        disabled={
                          kbSaving || !kbTrigger.trim() || !kbResponse.trim()
                        }
                      >
                        <Plus size={16} />
                        {kbSaving ? "Adding..." : "Add Entry"}
                      </button>
                    </div>
                  </div>

                  {/* List of entries */}
                  <div className={styles.kbList}>
                    <h4>{knowledgeEntries.length} Knowledge Entries</h4>
                    {knowledgeEntries.length === 0 ? (
                      <div className={styles.kbEmpty}>
                        <MessageSquare size={24} color="var(--text-muted)" />
                        <p>
                          No custom responses yet. Add trigger/response pairs
                          above.
                        </p>
                      </div>
                    ) : (
                      knowledgeEntries.map((entry) => (
                        <div key={entry.id} className={styles.kbEntry}>
                          <div className={styles.kbEntryContent}>
                            <div className={styles.kbTrigger}>
                              <span className={styles.kbLabel}>Trigger:</span>
                              <span className={styles.kbBadge}>
                                {entry.trigger}
                                {entry.is_exact_match && (
                                  <span className={styles.exactBadge}>
                                    exact
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className={styles.kbResponseText}>
                              <span className={styles.kbLabel}>Response:</span>
                              {entry.response}
                            </div>
                          </div>
                          <button
                            className={styles.kbDeleteBtn}
                            onClick={() => handleDeleteKnowledge(entry.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {editTab === "settings" && (
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={closeEditModal}>
                  Cancel
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleUpdate}
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ EMBED MODAL ═══════════════ */}
      {showEmbedModal && embedBot && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEmbedModal(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Embed {embedBot.name}</h2>
              <button
                className={styles.closeModal}
                onClick={() => setShowEmbedModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.embedContent}>
              <h3>Your Embed Code</h3>
              <p>
                Copy this script tag and paste it in any website&apos;s HTML to
                add the chatbot.
              </p>
              <div className={styles.scriptBox}>
                <code>{embedCode}</code>
              </div>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <div className={styles.previewSection}>
                <h4>Widget Preview</h4>
                <div className={styles.previewWidget}>
                  <div className={styles.previewChat}>
                    <div
                      className={styles.previewChatHeader}
                      style={{ background: embedBot.header_color }}
                    >
                      {embedBot.icon_url ? (
                        <img
                          src={embedBot.icon_url}
                          alt={embedBot.name}
                          className={styles.previewAvatar}
                        />
                      ) : (
                        <div className={styles.previewAvatarPlaceholder}>
                          {embedBot.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: embedBot.text_color,
                          }}
                        >
                          {embedBot.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            opacity: 0.7,
                            color: embedBot.text_color,
                          }}
                        >
                          ● Online
                        </div>
                      </div>
                    </div>
                    <div className={styles.previewChatBody}>
                      <div className={styles.previewMsg}>
                        {embedBot.welcome_message}
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles.previewBubble}
                    style={{ background: embedBot.primary_color }}
                  >
                    {embedBot.icon_url ? (
                      <img src={embedBot.icon_url} alt="icon" />
                    ) : (
                      <Bot size={24} color={embedBot.text_color} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Shared Settings Form ──
  function renderSettingsForm() {
    return (
      <>
        <div className={styles.formGroup}>
          <label>Bot Name *</label>
          <input
            type="text"
            placeholder="e.g. Customer Support Bot"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Welcome Message</label>
          <textarea
            placeholder="Hi! How can I help you today?"
            value={formData.welcome_message}
            onChange={(e) =>
              setFormData({ ...formData, welcome_message: e.target.value })
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>Bot Icon</label>
          {iconPreview ? (
            <div className={styles.uploadPreview}>
              <img src={iconPreview} alt="Icon preview" />
              <span>{iconFile?.name || "Current icon"}</span>
              <button
                className={styles.removeIcon}
                onClick={() => {
                  setIconFile(null);
                  setIconPreview(null);
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className={styles.fileUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} color="var(--secondary)" />
              <p>Click to upload an icon image (PNG, JPG, SVG)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconChange}
              />
            </div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Colors</label>
          <div className={styles.colorGroup}>
            <div className={styles.colorItem}>
              <label>Primary</label>
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData({ ...formData, primary_color: e.target.value })
                }
              />
            </div>
            <div className={styles.colorItem}>
              <label>Header</label>
              <input
                type="color"
                value={formData.header_color}
                onChange={(e) =>
                  setFormData({ ...formData, header_color: e.target.value })
                }
              />
            </div>
            <div className={styles.colorItem}>
              <label>Chat Bubble</label>
              <input
                type="color"
                value={formData.bubble_color}
                onChange={(e) =>
                  setFormData({ ...formData, bubble_color: e.target.value })
                }
              />
            </div>
            <div className={styles.colorItem}>
              <label>Text</label>
              <input
                type="color"
                value={formData.text_color}
                onChange={(e) =>
                  setFormData({ ...formData, text_color: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Widget Position</label>
          <div className={styles.positionGroup}>
            <button
              className={`${styles.positionOption} ${formData.position === "bottom-left" ? styles.positionOptionActive : ""}`}
              onClick={() =>
                setFormData({ ...formData, position: "bottom-left" })
              }
            >
              ↙ Bottom Left
            </button>
            <button
              className={`${styles.positionOption} ${formData.position === "bottom-right" ? styles.positionOptionActive : ""}`}
              onClick={() =>
                setFormData({ ...formData, position: "bottom-right" })
              }
            >
              ↘ Bottom Right
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderPreview() {
    return (
      <div className={styles.previewSection}>
        <h4>Live Preview</h4>
        <div className={styles.previewWidget}>
          <div className={styles.previewChat}>
            <div
              className={styles.previewChatHeader}
              style={{ background: formData.header_color }}
            >
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="preview"
                  className={styles.previewAvatar}
                />
              ) : (
                <div className={styles.previewAvatarPlaceholder}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: formData.text_color,
                  }}
                >
                  {formData.name || "Bot Name"}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.7,
                    color: formData.text_color,
                  }}
                >
                  ● Online
                </div>
              </div>
            </div>
            <div className={styles.previewChatBody}>
              <div className={styles.previewMsg}>
                {formData.welcome_message || "Hi! How can I help you?"}
              </div>
            </div>
          </div>
          <div
            className={styles.previewBubble}
            style={{ background: formData.primary_color }}
          >
            {iconPreview ? (
              <img src={iconPreview} alt="icon" />
            ) : (
              <Bot size={24} color={formData.text_color} />
            )}
          </div>
        </div>
      </div>
    );
  }
}
