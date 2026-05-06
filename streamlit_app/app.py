"""
Streamlit host for the Replenishment Gap Scan prototype.

Bundles prototype/gap-scan HTML + CSS + JS into a single embed so it runs inside
components.html (srcdoc iframe) without a separate static server — suitable for
Streamlit Community Cloud.

Run from repo root:
  cd streamlit_app && pip install -r requirements.txt && streamlit run app.py
"""

from __future__ import annotations

import base64
import re
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# streamlit_app/ -> repo root -> prototype/gap-scan
REPO_ROOT = Path(__file__).resolve().parent.parent
PROTOTYPE_DIR = REPO_ROOT / "prototype" / "gap-scan"


def _minimal_logo_data_uri() -> str:
    """1×1 transparent PNG if assets/sap-logo.png is missing."""
    return (
        "data:image/png;base64,"
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    )


def build_embed_html() -> str:
    if not PROTOTYPE_DIR.is_dir():
        raise FileNotFoundError(f"Prototype not found: {PROTOTYPE_DIR}")

    html_path = PROTOTYPE_DIR / "index.html"
    css_path = PROTOTYPE_DIR / "styles.css"
    js_path = PROTOTYPE_DIR / "app.js"
    logo_path = PROTOTYPE_DIR / "assets" / "sap-logo.png"

    html = html_path.read_text(encoding="utf-8")
    css = css_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")

    if logo_path.is_file():
        b64 = base64.b64encode(logo_path.read_bytes()).decode("ascii")
        img_src = f"data:image/png;base64,{b64}"
    else:
        img_src = _minimal_logo_data_uri()

    html = html.replace('src="assets/sap-logo.png"', f'src="{img_src}"')
    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="styles\.css"\s*/>',
        f"<style>\n{css}\n</style>",
        html,
        count=1,
    )
    html = re.sub(
        r'<script\s+src="app\.js"\s*>\s*</script>',
        f"<script>\n{js}\n</script>",
        html,
        count=1,
    )
    return html


def main() -> None:
    st.set_page_config(
        page_title="Replenishment App",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    st.sidebar.markdown("### Replenishment prototype")
    st.sidebar.caption(
        "Embedded gap-scan UI. Source: `prototype/gap-scan/`. "
        "See Docs/ReplenishmentArchitecture.md."
    )
    viewport_h = st.sidebar.slider("Embed height (px)", 700, 1400, 950, 25)

    try:
        bundle = build_embed_html()
    except FileNotFoundError as e:
        st.error(str(e))
        st.stop()

    components.html(bundle, height=viewport_h, scrolling=True)


if __name__ == "__main__":
    main()
