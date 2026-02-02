# Project Plan: Freelance Project Manager Agent (MVP)

## 1. Project Goal

สร้าง AI Agent ที่ทำหน้าที่เป็น "ผู้ช่วยบริหารโปรเจค" (Project Manager) สำหรับ Freelancer และ Digital Agency ขนาดเล็ก โดยเริ่มจาก MVP ที่แก้ปัญหาเรื่องการทำใบเสนอราคา (Quotation) และขอบเขตงาน (Scope of Work - SOW)

## 2. MVP Scope: "The SOW Architect"

ระบบที่รับ "บรีฟดิบ" จากลูกค้า แล้วเปลี่ยนเป็น "เอกสารขอบเขตงาน (SOW)" ที่รัดกุม เป็นมืออาชีพ และป้องกัน Scope Creep

### Core Features

1.  **Requirement Analysis:** รับ Input เป็น��้อความหรือไฟล์ แล้ววิเคราะห์ความต้องการ
2.  **Clarification Loop (LangGraph):** ถ้าข้อมูลไม่พอ AI จะถามคำถามกลับ (ไม่มโนเอง)
3.  **SOW Generation:** สร้างเอกสารที่มีหัวข้อครบ: Summary, Deliverables, In-Scope, Out-of-Scope, Timeline, Budget.

## 3. Tech Stack

- **Core AI:** Python (3.10+)
- **LLM:** Claude 3.5 Sonnet (via Anthropic API) or GPT-4o
- **Orchestration:** LangChain + LangGraph (Stateful Multi-Agent)
- **Backend:** FastAPI
- **Frontend:** Next.js + Shadcn UI
- **Database:** Supabase (PostgreSQL)

## 4. Development Roadmap (4 Weeks)

### Phase 1: Core Logic (Week 1)

- [ ] Initialize Repository & Environment
- [ ] Design LangGraph State (Graph Schema)
- [ ] Implement Node A: Analyst (Analyze requirements)
- [ ] Implement Node B: Interviewer (Generate questions)
- [ ] Implement Node C: Writer (Draft SOW)
- [ ] Test flow with mock data

### Phase 2: API & Backend (Week 2)

- [ ] Setup FastAPI project structure
- [ ] Create Endpoints: `/chat`, `/generate-sow`, `/history`
- [ ] Implement Memory/Persistence (save chat history in Supabase)

### Phase 3: Frontend & UI (Week 3)

- [ ] Setup Next.js project
- [ ] Build Chat Interface (Stream responses)
- [ ] Build Document Viewer (Markdown/PDF view)
- [ ] Implement Export to PDF feature

### Phase 4: Polish & Launch (Week 4)

- [ ] Refine Prompts (Prompt Engineering)
- [ ] User Testing (with real freelance briefs)
- [ ] Deploy (Vercel for Frontend, Railway/Render for Backend)

## 5. System Prompt Strategy (Draft)

**Role:** Senior Technical Project Manager
**Task:** Convert vague client briefs into professional Scope of Work documents.

**Rules:**

1. NEVER assume features that are not explicitly stated.
2. If the brief is vague (e.g., "Make an app like Uber"), you MUST ask clarifying questions first.
3. Explicitly list "Out-of-Scope" items to protect the freelancer.
4. Tone: Professional, Consultative, Protective.

**Output Structure:**

- Executive Summary
- Functional Requirements
- Non-Functional Requirements
- Tech Stack
- Timeline & Milestones
- Investment (Budget)
