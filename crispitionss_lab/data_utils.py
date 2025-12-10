import pandas as pd
from io import BytesIO, StringIO

def read_dataset(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Lee CSV o Excel desde bytes."""
    if filename.lower().endswith(".csv"):
        # Try to parse dates automatically
        df = pd.read_csv(StringIO(file_bytes.decode("utf-8")))
        # Attempt to convert common date columns
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                except:
                    pass
        return df
    elif filename.lower().endswith((".xls", ".xlsx")):
        df = pd.read_excel(BytesIO(file_bytes))
        return df
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

    # Time Series Summary
    date_cols = df.select_dtypes(include=['datetime']).columns
    for dt_col in date_cols:
        lines.append(f"\nResumen Temporal ({dt_col}):")
        lines.append(f"- Inicio: {df[dt_col].min()}")
        lines.append(f"- Fin: {df[dt_col].max()}")
        
        # Resample numeric columns by Year or Month if possible
        for num in num_cols:
            if "id" in num.lower(): continue
            try:
                # Group by Year and take mean
                lines.append(f"\n- Tendencia Anual '{num}':")
                # Create a temporary column for year to avoid modifying original df
                temp_year = df[dt_col].dt.year
                yearly_avg = df.groupby(temp_year)[num].mean().head(10).to_dict() # Top 10 years to save space? Or last 10?
                # Let's take 10 evenly spaced points if many years
                keys = sorted(list(yearly_avg.keys()))
                if len(keys) > 10:
                    keys = keys[::len(keys)//10]
                
                for k in keys:
                    lines.append(f"  {k}: {yearly_avg[k]:.2f}")
            except Exception:
                pass
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
