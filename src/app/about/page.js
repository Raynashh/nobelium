import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: "4rem 1.5rem", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1.5rem", color: "var(--primary)" }}>About Nobelium</h1>
      
      <div className="article-content">
        <p>Nobelium is the premier student-run publication dedicated to STEM research, breakthroughs, and discussions at Noble and Greenough School.</p>
        
        <h2>Our Mission</h2>
        <p>Our mission is to empower student voices and provide a platform for rigorous scientific inquiry, opinion, and feature writing. We strive to make complex topics accessible and engaging for our entire community.</p>

        <h2>The Editorial Team</h2>
        <p>We are a passionate team of student editors, writers, and designers. We collaborate closely with faculty advisors to ensure the highest standards of journalistic integrity and scientific accuracy.</p>
        
        <h2>Get Involved</h2>
        <p>Are you a student with a passion for science communication? We are always looking for new writers and editors to join our team.</p>
        
        <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
          <Link href="/articles" className="btn btn-primary">Read Articles <ArrowRight size={18} /></Link>
          <Link href="/login" className="btn btn-secondary">Author Login</Link>
        </div>
      </div>
    </div>
  );
}
