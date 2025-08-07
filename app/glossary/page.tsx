import React from "react";

const glossaryTerms = [
  {
    term: "Applicant",
    definition:
      "Any user registered with an applicant account type. Includes Individual Applicant and Organization Applicant.",
  },
  {
    term: "Application",
    definition:
      "The specific set of forms, documents, and attachments that comprise an applicant’s submission to a federal grant opportunity.",
  },
  {
    term: "Award",
    definition:
      "Financial assistance that provides support or stimulation to accomplish a public purpose. Includes grants and other agreements in the form of money or property.",
  },
  {
    term: "Budget",
    definition:
      "The financial plan for the project or program approved during the Federal award process.",
  },
  {
    term: "Cooperative Agreement",
    definition:
      "A legal instrument of financial assistance that requires substantial involvement between the Federal awarding agency and the non-Federal entity.",
  },
  {
    term: "Discretionary Grant",
    definition:
      "A grant for which the federal awarding agency selects the recipient based on programmatic, technical, or scientific content.",
  },
  {
    term: "Federal Award",
    definition:
      "The Federal financial assistance that a non-Federal entity receives directly or indirectly from a Federal awarding agency.",
  },
  {
    term: "Grant Agreement",
    definition:
      "A legal instrument of financial assistance used to transfer anything of value to carry out a public purpose authorized by law.",
  },
  {
    term: "Grantor",
    definition:
      "A user registered on behalf of their federal grant-making agency to post funding opportunities or manage submissions.",
  },
  {
    term: "Nonprofit Organization",
    definition:
      "An organization operated primarily for scientific, educational, service, charitable, or similar purposes in the public interest.",
  },
  {
    term: "Pass-Through Entity",
    definition:
      "A non-Federal entity that provides a subaward to a subrecipient to carry out part of a Federal program.",
  },
  {
    term: "Recipient",
    definition:
      "A non-Federal entity that receives a Federal award directly from a Federal awarding agency to carry out an activity.",
  },
  {
    term: "Subaward",
    definition:
      "An award provided by a pass-through entity to a subrecipient for part of a Federal award.",
  },
  {
    term: "Subrecipient",
    definition:
      "A non-Federal entity that receives a subaward from a pass-through entity to carry out part of a Federal program.",
  },
];

const FAQ = [
  {
    question: "What is a grant?",
    answer:
      "A grant is financial assistance provided by the government or other organizations to support a public purpose or project.",
  },
  {
    question: "Who can apply for grants?",
    answer:
      "Applicants can be individuals, organizations, nonprofits, educational institutions, or government entities depending on the grant requirements.",
  },
  {
    question:
      "What is the difference between a grant and a cooperative agreement?",
    answer:
      "A cooperative agreement involves substantial involvement between the funding agency and recipient, while a grant generally does not.",
  },
  {
    question: "How do I find grant opportunities?",
    answer:
      "Grant opportunities can be found on official websites like Grants.gov and other funding agency portals.",
  },
  {
    question: "What is a funding opportunity announcement (FOA)?",
    answer:
      "An FOA is a publicly available document announcing the availability of discretionary grants or cooperative agreements.",
  },
];

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function GlossaryPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Grants Glossary & FAQ</h1>

      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Glossary of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-6">
              {glossaryTerms.map(({ term, definition }) => (
                <div key={term} className="border-b last:border-b-0 py-3">
                  <dt className="font-semibold text-lg">{term}</dt>
                  <dd className="ml-4 text-muted-foreground">{definition}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {FAQ.map(({ question, answer }) => (
              <div
                key={question}
                className="border rounded-md p-4 bg-background shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2">{question}</h3>
                <p className="text-muted-foreground">{answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
