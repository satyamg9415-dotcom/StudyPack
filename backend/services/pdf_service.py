import io
import logging
from typing import Any, Dict, List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger(__name__)


class NumberedCanvas:
    """Canvas wrapper that adds two-pass running header and footer with total page count."""

    def __init__(self, *args, **kwargs):
        from reportlab.pdfgen import canvas

        self._canvas_class = canvas.Canvas
        self.pages = []

    def __call__(self, *args, **kwargs):
        canvas_inst = self._canvas_class(*args, **kwargs)
        orig_showPage = canvas_inst.showPage
        orig_save = canvas_inst.save

        def showPage():
            self.pages.append(dict(canvas_inst.__dict__))
            orig_showPage()

        def save():
            num_pages = len(self.pages)
            for page in self.pages:
                canvas_inst.__dict__.update(page)
                self.draw_header_footer(canvas_inst, num_pages)
                orig_showPage()
            orig_save()

        canvas_inst.showPage = showPage
        canvas_inst.save = save
        return canvas_inst

    def draw_header_footer(self, canvas, num_pages):
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(colors.HexColor("#4F46E5"))  # Indigo

        # Running Header (pages > 1)
        if canvas._pageNumber > 1:
            canvas.drawString(54, 11 * inch - 36, "StudyPack AI — Comprehensive Academic Study Pack")
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(colors.HexColor("#64748B"))
            canvas.drawRightString(8.5 * inch - 54, 11 * inch - 36, "Powered by Google Gemini")
            canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
            canvas.setLineWidth(0.5)
            canvas.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(54, 36, "Confidential & Academic Personal Use Only • StudyPack AI")
        page_str = f"Page {canvas._pageNumber} of {num_pages}"
        canvas.drawRightString(8.5 * inch - 54, 36, page_str)
        canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
        canvas.setLineWidth(0.5)
        canvas.line(54, 46, 8.5 * inch - 54, 46)

        canvas.restoreState()


def generate_study_pack_pdf(data: Dict[str, Any]) -> bytes:
    """
    Generates a PDF document for a complete Study Pack including:
    - Metadata Header / Title
    - Lecture Overview & Key Takeaways
    - Chapter-Wise Summaries & Important Explanations
    - Key Terms & Definitions Glossary
    - Practice Questions with Model Answers
    - Quiz Questions with Answers & Explanations
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#4338CA")      # Indigo 700
    SECONDARY = colors.HexColor("#6D28D9")    # Purple 700
    TEXT_MAIN = colors.HexColor("#0F172A")    # Slate 900
    TEXT_MUTED = colors.HexColor("#475569")   # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Slate 50
    BORDER_LIGHT = colors.HexColor("#E2E8F0") # Slate 200
    ACCENT_GREEN = colors.HexColor("#059669") # Emerald 600

    # Custom Typography Styles
    style_super_title = ParagraphStyle(
        "SuperTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=SECONDARY,
        textTransform="uppercase",
        spaceAfter=4,
    )

    style_title = ParagraphStyle(
        "PackTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=6,
    )

    style_meta = ParagraphStyle(
        "MetaText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED,
        spaceAfter=12,
    )

    style_section_h1 = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    style_chapter_h2 = ParagraphStyle(
        "ChapterH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    style_body = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=TEXT_MAIN,
        spaceAfter=6,
    )

    style_bullet = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        leftIndent=14,
        spaceAfter=3,
    )

    style_table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
    )

    style_table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MAIN,
    )

    style_table_term = ParagraphStyle(
        "TableTerm",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=PRIMARY,
    )

    style_question = ParagraphStyle(
        "QuestionText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=TEXT_MAIN,
        spaceAfter=3,
    )

    style_model_answer = ParagraphStyle(
        "ModelAnswer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=ACCENT_GREEN,
        leftIndent=10,
        spaceAfter=6,
    )

    story = []

    # 1. Title Banner Block
    title = data.get("title") or "Study Pack"
    subject = data.get("subject") or "General Lecture"
    academic_level = data.get("academic_level") or "Undergraduate"
    date_str = data.get("date") or "Recently Created"
    doc_name = data.get("document_name") or data.get("fileName") or "Uploaded Notes"

    story.append(Paragraph("StudyPack AI • Comprehensive Academic Notes", style_super_title))
    story.append(Paragraph(title, style_title))
    story.append(
        Paragraph(
            f"<b>Subject:</b> {subject} &nbsp;|&nbsp; <b>Academic Level:</b> {academic_level} &nbsp;|&nbsp; "
            f"<b>Source:</b> {doc_name} &nbsp;|&nbsp; <b>Date:</b> {date_str}",
            style_meta,
        )
    )
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=14))

    # 2. Overview Section
    overview = data.get("overview")
    if overview:
        story.append(Paragraph("1. Executive Lecture Overview", style_section_h1))
        story.append(Paragraph(overview, style_body))
        story.append(Spacer(1, 6))

    # Key Takeaways
    takeaways = data.get("key_takeaways") or []
    if takeaways:
        story.append(Paragraph("<b>Key Takeaways:</b>", style_chapter_h2))
        for item in takeaways:
            story.append(Paragraph(f"• {item}", style_bullet))
        story.append(Spacer(1, 8))

    # 3. Chapter-Wise Summaries
    chapters = data.get("chapters") or []
    if chapters:
        story.append(Paragraph("2. Chapter-Wise Detailed Summaries", style_section_h1))
        for idx, ch in enumerate(chapters, 1):
            if isinstance(ch, dict):
                ch_title = ch.get("chapter_title") or ch.get("title") or f"Chapter {idx}"
                story.append(Paragraph(f"Chapter {idx}: {ch_title}", style_chapter_h2))

                summary_pts = ch.get("summary_points") or []
                if summary_pts:
                    for pt in summary_pts:
                        story.append(Paragraph(f"• {pt}", style_bullet))
                elif ch.get("summary"):
                    story.append(Paragraph(ch.get("summary"), style_body))

                if ch.get("takeaway"):
                    story.append(Paragraph(f"<b>Key Takeaway:</b> {ch.get('takeaway')}", style_body))
            elif isinstance(ch, str):
                story.append(Paragraph(f"• {ch}", style_bullet))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 8))

    # Important Explanations
    explanations = data.get("important_explanations") or []
    if explanations:
        story.append(Paragraph("3. Important Concept Explanations & Formulas", style_section_h1))
        for exp in explanations:
            if isinstance(exp, str):
                story.append(Paragraph(f"• {exp}", style_bullet))
            elif isinstance(exp, dict):
                concept = exp.get("concept") or exp.get("title") or "Core Concept"
                detail = exp.get("explanation") or exp.get("detail") or ""
                story.append(Paragraph(f"<b>{concept}</b>", style_chapter_h2))
                if detail:
                    story.append(Paragraph(detail, style_body))
                if exp.get("example_or_formula"):
                    formula_box = [
                        [Paragraph(f"<b>Formula / Example:</b> {exp.get('example_or_formula')}", style_body)]
                    ]
                    t_box = Table(formula_box, colWidths=[504])
                    t_box.setStyle(
                        TableStyle([
                            ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
                            ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ])
                    )
                    story.append(t_box)
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 8))

    # 4. Key Terms Glossary Table
    keywords = data.get("keywords") or []
    if keywords:
        story.append(PageBreak())
        story.append(Paragraph("4. Key Academic Terms & Definitions Glossary", style_section_h1))
        story.append(
            Paragraph(
                "Essential technical definitions extracted from lecture notes prioritized for exams.",
                style_body,
            )
        )

        table_data = [
            [
                Paragraph("Term", style_table_header),
                Paragraph("Topic", style_table_header),
                Paragraph("Definition & Context", style_table_header),
                Paragraph("Importance", style_table_header),
            ]
        ]

        for k in keywords:
            term = k.get("term") or ""
            topic = k.get("topic") or "General"
            definition = k.get("definition") or ""
            context = k.get("context") or ""
            full_def = f"{definition}<br/><font color='#64748B'><i>Context: {context}</i></font>" if context else definition
            importance = k.get("importance") or "Medium"

            table_data.append([
                Paragraph(term, style_table_term),
                Paragraph(topic, style_table_cell),
                Paragraph(full_def, style_table_cell),
                Paragraph(importance, style_table_cell),
            ])

        col_widths = [110, 84, 250, 60]
        term_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        term_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ])
        )
        story.append(term_table)
        story.append(Spacer(1, 14))

    # 5. Practice Questions & Model Answers
    questions = data.get("practice_questions") or []
    if questions:
        story.append(KeepTogether([
            Paragraph("5. Practice Questions & Model Answers", style_section_h1),
            Paragraph(
                "Balanced set of conceptual, short-answer, and application questions with reference solutions.",
                style_body,
            ),
        ]))

        for i, q in enumerate(questions, 1):
            q_text = q.get("question") or ""
            q_type = q.get("question_type") or "Conceptual"
            difficulty = q.get("difficulty") or "Medium"
            model_ans = q.get("model_answer") or q.get("answer") or ""
            topic = q.get("relevant_topic") or ""

            badge_info = f"<font color='#4F46E5'>[{q_type} • {difficulty}]</font>"
            if topic:
                badge_info += f" <font color='#64748B'>Topic: {topic}</font>"

            q_flowables = [
                Paragraph(f"<b>Q{i}.</b> {q_text} {badge_info}", style_question),
                Paragraph(f"<b>Model Answer:</b> {model_ans}", style_model_answer),
            ]
            if q.get("explanation"):
                q_flowables.append(
                    Paragraph(f"<b>Explanation:</b> {q.get('explanation')}", style_body)
                )
            q_flowables.append(Spacer(1, 4))
            story.append(KeepTogether(q_flowables))

        story.append(Spacer(1, 10))

    # 6. MCQ Quiz Assessment
    quiz = data.get("quiz") or []
    if quiz:
        quiz_header_flowables = [
            Paragraph("6. Interactive MCQ Quiz Questions", style_section_h1),
        ]
        last_score = data.get("lastQuizScore")
        if last_score:
            score_txt = (
                f"<b>Student Attempt Score:</b> {last_score.get('score')}/{last_score.get('total')} "
                f"({last_score.get('percentage')}%) on {last_score.get('date', '')[:10]}"
            )
            quiz_header_flowables.append(Paragraph(score_txt, style_body))

        story.append(KeepTogether(quiz_header_flowables))

        for j, item in enumerate(quiz, 1):
            stmt = item.get("question_statement") or item.get("question") or ""
            opts = item.get("options") or []
            correct = item.get("correct_answer") or item.get("correct_option_id") or ""
            expl = item.get("explanation") or ""
            diff = item.get("difficulty") or "Medium"

            quiz_items = [
                Paragraph(f"<b>Quiz {j}.</b> {stmt} <font color='#6D28D9'>({diff})</font>", style_question),
            ]
            for opt in opts:
                opt_id = opt.get("id") or ""
                opt_txt = opt.get("text") or ""
                is_correct = opt_id == correct
                marker = "<b>[CORRECT] </b>" if is_correct else ""
                quiz_items.append(Paragraph(f"&nbsp;&nbsp;<b>{opt_id}.</b> {marker}{opt_txt}", style_bullet))

            if expl:
                quiz_items.append(
                    Paragraph(f"<b>Answer Rationale:</b> {expl}", style_model_answer)
                )
            quiz_items.append(Spacer(1, 4))
            story.append(KeepTogether(quiz_items))

    # Build Document using NumberedCanvas
    canvas_maker = NumberedCanvas()
    doc.build(story, canvasmaker=canvas_maker)

    buffer.seek(0)
    return buffer.getvalue()
