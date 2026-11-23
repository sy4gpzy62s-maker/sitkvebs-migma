import { useEffect, useRef, useState } from "react";
import { ITEMS, AUTHORS, MOVEMENTS, SITE } from "./data.js";

const NAV = [["/", "მთავარი"], ["/articles", "სტატიები"], ["/reviews", "წიგნების მიმოხილვები"], ["/authors", "ავტორები და ლიტერატურა"], ["/creative", "შემოქმედება"], ["/about", "ჩვენს შესახებ"]];
const fmt = (d) => new Date(d).toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric" });
const get = () => location.hash.slice(1) || "/";

function useRoute() {
  const [r, setR] = useState(get());
  useEffect(() => {
    const f = () => { setR(get()); window.scrollTo({ top: 0 }); };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  return r;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(); const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(ref.current); return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${v ? "in" : ""} ${className}`} style={{ transitionDelay: delay + "ms" }}>{children}</div>;
}

function Cover({ item, className = "" }) {
  return item.cover
    ? <img className={"cover " + className} src={item.cover} alt={item.coverAlt || item.title} loading="lazy" />
    : <div className={"cover ph " + className} aria-hidden="true"><span>{item.title.replace(/[„“"]/g, "")[0]}</span></div>;
}

function Card({ item, i = 0 }) {
  return (
    <Reveal delay={i * 80}>
      <a className="card" href={`#/article/${item.id}`}>
        <Cover item={item} />
        <div className="meta">{item.category}, {fmt(item.date)}</div>
        <h3>{item.title}</h3><p>{item.excerpt}</p><span className="by">{item.author}</span>
      </a>
    </Reveal>
  );
}

const Head = ({ title, lead }) => (<header className="pagehead"><h1>{title}</h1>{lead && <p>{lead}</p>}</header>);

function Browse({ type, title, lead }) {
  const base = ITEMS.filter((x) => !type || x.type === type);
  const cats = ["ყველა", ...new Set(base.map((x) => x.category))];
  const [c, setC] = useState("ყველა"); const [q, setQ] = useState("");
  const list = base.filter((x) => (c === "ყველა" || x.category === c) && (x.title + x.author + x.excerpt + x.body.join(" ")).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <section className="wrap">
      <Head title={title} lead={lead} />
      <div className="tools">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ძიება სათაურით, ავტორით, ტექსტით…" aria-label="ძიება" />
        <div className="chips" role="group" aria-label="კატეგორიები">
          {cats.map((k) => <button key={k} className={k === c ? "chip on" : "chip"} aria-pressed={k === c} onClick={() => setC(k)}>{k}</button>)}
        </div>
      </div>
      {list.length ? <div className="grid">{list.map((x, i) => <Card key={x.id} item={x} i={i} />)}</div>
        : <p className="empty">ამ პირობებით ტექსტი ვერ მოიძებნა. სცადე სხვა სიტყვა ან აირჩიე „ყველა“.</p>}
    </section>
  );
}

function Home() {
  const [f, ...rest] = ITEMS;
  return (
    <>
      <section className="hero wrap">
        <div className="hero-text">
          <p className="kicker">დამოუკიდებელი ლიტერატურული ჟურნალი</p>
          <h1>სიტყვებს მიღმა</h1>
          <p className="lead">წიგნები გვასწავლის, როგორ ვიცხოვროთ ათასი ცხოვრებით, მაშინაც კი, როცა მხოლოდ ერთი გვაქვს.</p>
          <div className="actions"><a className="btn" href="#/articles">წაიკითხე სტატიები</a><a className="btn ghost" href="#/submit">გამოგვიგზავნე ნაშრომი</a></div>
        </div>
        <Cover item={f} />
      </section>
      <section className="wrap"><Reveal><h2 className="sect">ახალი ნომრიდან</h2></Reveal>
        <div className="grid">{rest.slice(0, 3).map((x, i) => <Card key={x.id} item={x} i={i} />)}</div></section>
      <Reveal className="quote"><blockquote>წიგნი ის კარია, რომელსაც მხოლოდ შიგნიდან ამჩნევ.</blockquote><p>რედაქციის დევიზი </p></Reveal>
      <section className="wrap center"><Reveal><h2 className="sect">გაქვს დაწერილი ტექსტი?</h2><p className="lead">ჩვენ ვეძებთ ახალ ხმებს. ლექსი, ესე თუ მოთხრობა — გამოგვიგზავნე.</p><a className="btn" href="#/submit">ნაშრომის გაგზავნა</a></Reveal></section>
    </>
  );
}

function ArticlePage({ id }) {
  const a = ITEMS.find((x) => x.id === id);
  if (!a) return <section className="wrap"><Head title="ტექსტი ვერ მოიძებნა" lead="შესაძლოა, ბმული შეცვლილია." /><a className="btn" href="#/articles">სტატიებზე დაბრუნება</a></section>;
  const more = ITEMS.filter((x) => x.id !== a.id && x.type === a.type).slice(0, 3);
  return (
    <article className="wrap narrow">
      <a className="back" href="#/articles">← ყველა ტექსტი</a>
      <div className="meta">{a.category}, {fmt(a.date)}</div>
      <h1>{a.title}</h1><p className="by big">{a.author}</p>
      <Cover item={a} className="wide" />
      <div className="body">{a.body.map((p, i) => <p key={i} className={i === 0 ? "dropcap" : ""}>{p}</p>)}</div>
      {more.length > 0 && <><h2 className="sect">ასევე წაიკითხე</h2><div className="grid">{more.map((x, i) => <Card key={x.id} item={x} i={i} />)}</div></>}
    </article>
  );
}

function Authors() {
  return (
    <section className="wrap">
      <Head title="ავტორები და ლიტერატურა" lead="ლიტერატურული მიმდინარეობები და სახელები, რომლებიც ქართულ მწერლობას აყალიბებდნენ." />
      <h2 className="sect">მიმდინარეობები</h2>
      <div className="grid">{MOVEMENTS.map((m, i) => <Reveal key={m.name} delay={i * 80}><div className="card plain"><h3>{m.name}</h3><p>{m.text}</p></div></Reveal>)}</div>
      <h2 className="sect">ავტორები</h2>
     <div className="grid four">{AUTHORS.map((m, i) => <Reveal key={m.name} delay={i * 80}><div className="card plain">{m.photo && <img className="cover portrait" src={m.photo} alt={m.name} loading="lazy" />}<h3>{m.name}</h3><p>{m.text}</p></div></Reveal>)}</div>
    </section>
  );
}

function About() {
  return (
    <section className="wrap narrow">
      <Head title="ჩვენს შესახებ" lead="ლიტერატურის კლუბი „carpe diem“ — მკითხველებისა და დამწყები ავტორების სივრცე." />
      <div className="body">
        <p className="dropcap">ჩვენი ლიტერატურის კლუბი, სახელად carpe diem ფუნქციონირებს ქ.რუსთავის ივანე ჯავახიშვილის სახელობის N24 ქართულ გიმნაზიაში. კლუბის ინიციატორები და ორგანიზატორები არიან ბარბარე ჯავახიშვილი და ნიაკო მაღრაძე. 
carpe diem არის სივრცე იმ მოსწავლეებისთვის, რომლებსაც აინტერესებთ ლიტერატურა, კითხვა და ახალი იდეების აღმოჩენა.
კლუბის მიზანია კითხვის კულტურის პოპულარიზაცია, კრიტიკული და შემოქმედებითი აზროვნების განვითარება და მოსწავლეებში ლიტერატურისადმი ინტერესის გაღვივება.
კლუბის ფარგლებში გაიმართება წიგნების განხილვები, დისკუსიები, თემატური შეხვედრები, ლიტერატურული ღონისძიებები და სხვადასხვა შემოქმედებითი აქტივობა.
ჩვენი სურვილია, შევქმნათ გარემო, სადაც მოსწავლეები შეძლებენ საკუთარი აზრების თავისუფლად გამოხატვას, ერთმანეთის მოსმენას და ლიტერატურის ახალი პერსპექტივიდან აღმოჩენას.
.</p>
        <p>თუ გინდა კლუბს შეუერთდე ან ტექსტი გამოგვიგზავნო, გადადი გვერდზე <a href="#/submit">„გამოგვიგზავნე ნაშრომი“</a>.</p>
      </div>
    </section>
  );
}

function Submit() {
  const [st, setSt] = useState("idle");
  const ready = Boolean(SITE.formEndpoint);
  async function send(e) {
    e.preventDefault(); if (!ready) return;
    setSt("sending");
    try {
      const r = await fetch(SITE.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(e.target) });
      if (r.ok) { setSt("ok"); e.target.reset(); } else setSt("err");
    } catch { setSt("err"); }
  }
  return (
    <section className="wrap narrow">
      <Head title="გამოგვიგზავნე ნაშრომი" lead="ლექსი, ესე, მოთხრობა ან სტატია — ყველა ტექსტს ყურადღებით ვკითხულობთ." />
      <div className="notice"><strong>როგორ მოდის ტექსტი ჩვენამდე?</strong> ფორმა აგზავნის ტექსტს უფასო სერვისის, Formspree-ს, საშუალებით და ის პირდაპირ რედაქციის ელფოსტაზე მოდის. რედაქცია პასუხობს ავტორს მითითებულ ელფოსტაზე.
        {!ready && <p className="warn">⚠ ფორმა ჯერ არ არის დაკავშირებული. გაგზავნა იმუშავებს მას შემდეგ, რაც ფაილში <code>src/data.js</code> ჩაწერ შენს Formspree მისამართს (ინსტრუქცია — README.md).</p>}</div>
      <form className="form" onSubmit={send}>
        <label>სახელი და გვარი<input name="author" required autoComplete="name" /></label>
        <label>ელფოსტა<input name="email" type="email" required autoComplete="email" /></label>
        <label>ტექსტის სათაური<input name="title" required /></label>
        <label>კატეგორია<select name="category" required defaultValue=""><option value="" disabled>აირჩიე…</option><option>სტატია</option><option>ესე</option><option>ლექსი</option><option>მოთხრობა</option><option>წიგნის მიმოხილვა</option></select></label>
        <label>ტექსტი<textarea name="text" rows="12" required /></label>
        <button className="btn" disabled={!ready || st === "sending"}>{st === "sending" ? "იგზავნება…" : "გაგზავნა"}</button>
        {st === "ok" && <p className="okmsg" role="status">მადლობა! ტექსტი მივიღეთ და მალე დაგიკავშირდებით.</p>}
        {st === "err" && <p className="errmsg" role="alert">გაგზავნა ვერ მოხერხდა. სცადე თავიდან ან მოგვწერე უშუალოდ ელფოსტით.</p>}
      </form>
    </section>
  );
}

export default function App() {
  const r = useRoute(); const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [r]);
  const m = r.match(/^\/article\/(.+)$/);
  const page = m ? <ArticlePage id={m[1]} />
    : r === "/articles" ? <Browse title="სტატიები" lead="ესეები და წერილები ლიტერატურაზე." type="article" />
    : r === "/reviews" ? <Browse title="წიგნების მიმოხილვები" lead="რას ვკითხულობთ და რატომ." type="review" />
    : r === "/creative" ? <Browse title="შემოქმედება" lead="ლექსები, ესეები და მოთხრობები ჩვენი მკითხველებისგან." type="creative" />
    : r === "/authors" ? <Authors /> : r === "/about" ? <About /> : r === "/submit" ? <Submit /> : <Home />;
  const cur = (p) => (p === "/" ? r === "/" : r.startsWith(p)) ? "page" : undefined;
  return (
    <>
      <header className="top">
        <a className="logo" href="#/">სიტყვებს მიღმა</a>
        <button className="burger" aria-expanded={open} aria-label="მენიუ" onClick={() => setOpen(!open)}><span /><span /><span /></button>
        <nav className={open ? "nav open" : "nav"} aria-label="მთავარი მენიუ">
          {NAV.map(([p, t]) => <a key={p} href={"#" + p} aria-current={cur(p)}>{t}</a>)}
          <a className="btn small" href="#/submit" aria-current={cur("/submit")}>გამოგვიგზავნე ნაშრომი</a>
        </nav>
      </header>
      <main key={r} className="page" tabIndex="-1">{page}</main>
      <footer className="foot"><strong>სიტყვებს მიღმა</strong><span>ლიტერატურის კლუბის ჟურნალი © {new Date().getFullYear()}</span></footer>
    </>
  );
}
