import pandas as pd
from io import BytesIO, StringIO

def read_dataset(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Lee CSV o Excel desde bytes."""
    if filename.lower().endswith(".csv"):
        return pd.read_csv(StringIO(file_bytes.decode("utf-8")))
    elif filename.lower().endswith((".xls", ".xlsx")):
        return pd.read_excel(BytesIO(file_bytes))
    else:
        raise ValueError("Formato de archivo no soportado. Usa CSV o Excel.")

def summarize_df(df: pd.DataFrame, max_rows: int = 5) -> str:
    """Crea un resumen compacto del DataFrame para enviarlo al modelo."""
    lines = []

    lines.append("Columnas y tipos:")
    for col, dtype in df.dtypes.items():
        lines.append(f"- {col}: {dtype}")

    lines.append("\nPrimeras filas:")
    lines.append(df.head(max_rows).to_markdown(index=False))

    lines.append("\nEstadísticas descriptivas:")
    desc = df.describe(include="all").transpose()
    lines.append(desc.to_markdown())

    lines.append("\nTop valores (frecuencia) para columnas categóricas:")
    for col in df.select_dtypes(include=['object', 'category']).columns:
        lines.append(f"\nColumna: {col}")
        try:
            vc = df[col].value_counts().head(5)
            for val, count in vc.items():
                lines.append(f"- {val}: {count}")
        except Exception:
            pass

    lines.append("\nAgrupaciones interesantes (Relación Categoría vs Números):")
    # Identify numeric and categorical columns
    num_cols = df.select_dtypes(include=['number']).columns
    cat_cols = df.select_dtypes(include=['object', 'category']).columns

    # For each categorical column, try to group by it and sum/mean the first few numeric columns
    for cat in cat_cols:
        if df[cat].nunique() > 20: # Skip high cardinality
            continue
            
        for num in num_cols:
            if "id" in num.lower(): continue # Skip IDs
            
            try:
                # Top 5 categories by sum of this number
                lines.append(f"\nTop 5 '{cat}' por suma de '{num}':")
                grp_sum = df.groupby(cat)[num].sum().nlargest(5)
                for name, val in grp_sum.items():
                    lines.append(f"- {name}: {val:,.0f}")
                
            except Exception:
                pass

            except Exception:
                pass

    # Aggregations for Time/Numeric trends (e.g. Week of Year)
    for num_col_group in num_cols:
        if any(x in num_col_group.lower() for x in ['week', 'year', 'day', 'month', 'date', 'period']):
             for num_target in num_cols:
                 if num_col_group == num_target: continue
                 if "id" in num_target.lower(): continue
                 
                 try:
                     lines.append(f"\nTendencia: '{num_col_group}' vs Promedio de '{num_target}':")
                     # Sort by the time column
                     grp = df.groupby(num_col_group)[num_target].mean().sort_index().head(20) 
                     for t, val in grp.items():
                         lines.append(f"- {t}: {val:,.2f}")
                 except Exception:
                     pass

    return "\n".join(lines)
