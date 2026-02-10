# Project Plan: PM Copilot Agent (MVP)

## 1. Project Goal

สร้าง AI Agent ที่ทำหน้าที่เป็น "ผู้ช่วยบริหารโปรเจค" (Project Manager coplilot) สำหรับ Freelancer และ Project manager มืออาชีพ โดยเริ่มจาก MVP ที่แก้ปัญหาเรื่องการทำใบเสนอราคา (Quotation) และขอบเขตงาน (Scope of Work - SOW)

## 2. MVP Scope: "The SOW Architect"

ระบบที่รับ "บรีฟดิบ" จากลูกค้า แล้วเปลี่ยนเป็น "เอกสารขอบเขตงาน (SOW)" ที่รัดกุม เป็นมืออาชีพ และป้องกัน Scope Creep

### Core Features

1.  **Requirement Analysis:** รับ Input เป็น��้อความหรือไฟล์ แล้ววิเคราะห์ความต้องการ
2.  **Clarification Loop (LangGraph):** ถ้าข้อมูลไม่พอ AI จะถามคำถามกลับ (ไม่มโนเอง)
3.  **SOW Generation:** สร้างเอกสารที่มีหัวข้อครบ: Summary, Deliverables, In-Scope, Out-of-Scope, Timeline, Budget.

## 3. Tech Stack

- **Core AI:** Python (3.10+)
- **LLM:** Any model
- **Orchestration:** LangChain + LangGraph (Stateful Multi-Agent)
- **Backend:** FastAPI
- **Frontend:** Next.js + antd
- **Database:** Supabase (PostgreSQL)

## 4. Development Roadmap (4 Weeks)

### Phase 1: Core Logic (Week 1)

- [x] Initialize Repository & Environment
- [x] Design LangGraph State (Graph Schema)
- [x] Implement Node A: Analyst (Analyze requirements)
- [x] Implement Node B: Interviewer (Generate questions)
- [x] Implement Node C: Writer (Draft SOW)
- [x] Test flow with mock data

### Phase 2: API & Backend (Week 2)

- [x] Setup FastAPI project structure
- [x] Create Endpoints: `/chat`, `/generate-sow`, `/history`
- [x] Implement Memory/Persistence (save chat history in postgreSQL)

### Phase 3: Frontend & UI (Week 3)

- [ ] Setup Next.js project
- [ ] Build Chat Interface (Stream responses)
- [ ] Build Document Viewer (Markdown/PDF view)
- [ ] Implement Export to PDF feature

### Phase 4: Polish & Launch (Week 4)

- [ ] Refine Prompts (Prompt Engineering)
- [ ] User Testing (with real client briefs/RFPs)
- [ ] Deploy (Vercel for Frontend, Railway/Render for Backend)

## 5. System Prompt Strategy (Draft)

**Role:** Senior Technical Project Manager
**Task:** Convert vague client briefs into professional Scope of Work documents.

**Rules:**

1. NEVER assume features that are not explicitly stated.
2. If the brief is vague (e.g., "Make an app like Uber"), you MUST ask clarifying questions first.
3. Explicitly list "Out-of-Scope" items to ensure clarity and manage expectations.
4. Tone: Professional, Consultative, Protective.

**Output Structure:**

- Executive Summary
- Functional Requirements
- Non-Functional Requirements
- Tech Stack
- Timeline & Milestones
- Investment (Budget)
