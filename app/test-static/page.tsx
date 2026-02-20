export default function TestStaticPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Static Export Test</h1>
      <p>If you can see this, the static export is working correctly.</p>
      <p>This page should be generated in the <code>out</code> folder.</p>
    </div>
  );
}
