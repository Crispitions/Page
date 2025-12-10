import json
from typing import TypedDict, List

from langgraph.graph import StateGraph
from langchain_google_genai import ChatGoogleGenerativeAI


# ------------ ESTADO DEL AGENTE -----------------

class LabState(TypedDict, total=False):
    schema: str             # resumen del dataset
    user_request: str       # petición opcional del usuario
    analysis_text: str      # análisis en texto
    charts_spec: List[dict] # plan JSON de gráficas


# ------------ MODELO (GEMINI) --------------------

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
)


# ------------ NODO PRINCIPAL ---------------------

def plan_and_analyze(state: LabState) -> LabState:
    schema = state["schema"]
    user_request = state.get("user_request") or ""


    system_prompt = """
You are a senior data scientist.
You will receive:
1) A dataset summary (columns, dtypes, head, statistics)
2) An optional request from the user

Your tasks:
- Analyze the dataset and user request.
- Produce a clear EDA-style analysis.
- Propose 2-5 useful charts.

CRITICAL OUTPUT FORMAT:
You must return a SINGLE valid JSON object. Do not include markdown fencing (```json).
Structure:
{
  "analysis": "Your analysis text here...",
  "charts": [
    {
      "type": "bar",
      "title": "Chart Title",
      "x": "column_name",
      "y": "column_name",
      "comment": "Why this chart is useful",
      "data": [
        {"label": "Category A", "value": 10},
        {"label": "Category B", "value": 20}
      ]
    }
  ]
}
If exact data values are available in the summary (e.g. from value_counts or temporal trends), include them in the "data" field. 
IMPORTANT: If the user asks for a time series and you have a "Temporal Summary" (like yearly averages), USE THAT data for the chart. Do not simply say "no data". Plot the trend.
"""

    user_prompt = f"""
DATASET SUMMARY:
{schema}

USER REQUEST:
{user_request}
"""

    msg = llm.invoke([
        ("system", system_prompt),
        ("user", user_prompt),
    ])

    content = msg.content.strip()
    
    # Clean markdown if present
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    
    content = content.strip()

    try:
        data = json.loads(content)
        analysis_text = data.get("analysis", "No analysis found.")
        charts_spec = data.get("charts", [])
    except json.JSONDecodeError:
        # Fallback: if JSON fails, return raw content as analysis
        analysis_text = f"Error parsing JSON response. Raw output:\n\n{content}"
        charts_spec = []

    return {
        "analysis_text": analysis_text,
        "charts_spec": charts_spec,
    }


# ------------ GRAFO -----------------------------

graph_builder = StateGraph(LabState)

graph_builder.add_node("plan_and_analyze", plan_and_analyze)

graph_builder.set_entry_point("plan_and_analyze")
graph_builder.set_finish_point("plan_and_analyze")

lab_graph = graph_builder.compile()
