"use client";

export default function GlobalError({ reset }) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "#0b1410",
                    color: "#e6efe9",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                <div style={{ textAlign: "center", padding: 24 }}>
                    <h1>TestPay hit a problem</h1>
                    <p style={{ opacity: 0.7 }}>Please try again. If it keeps happening, reload the page.</p>
                    <button
                        onClick={reset}
                        style={{ marginTop: 12, padding: "8px 16px", borderRadius: 6, border: "1px solid #3a4a42", background: "transparent", color: "inherit", cursor: "pointer" }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}