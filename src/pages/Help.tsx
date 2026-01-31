import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      question: 'What is a BOID number?',
      answer: 'BOID (Beneficiary Owner Identification) is a unique 16-digit number assigned to each investor in Nepal. It starts with 130 and is used to identify your demat account with CDSC Nepal.',
    },
    {
      question: 'How many BOIDs can I check at once?',
      answer: 'You can check up to 500 BOID numbers in a single batch. For larger lists, we recommend splitting them into multiple batches to ensure reliable results.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'The application supports CSV (.csv), Excel (.xlsx, .xls), and plain text (.txt) files. BOIDs should be in the first column or one per line for text files.',
    },
    {
      question: 'Why do some checks fail?',
      answer: 'Checks may fail due to CAPTCHA timeout, network issues, or temporary unavailability of the CDSC website. Failed checks are automatically retried if the retry option is enabled.',
    },
    {
      question: 'How do I set up the CAPTCHA service?',
      answer: 'Go to Settings → CAPTCHA Configuration, select your preferred service (2Captcha or Anti-Captcha), and enter your API key. The key will be verified before use.',
    },
    {
      question: 'Can I pause and resume a check?',
      answer: 'Yes! During processing, you can pause the check at any time using the Pause button. Resume when ready, and it will continue from where it left off.',
    },
    {
      question: 'How do I export results?',
      answer: 'On the Results page, use the Export Excel or Export CSV buttons. The export includes all checked BOIDs with their status, share allocation, and other details.',
    },
  ];

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with using the IPO Checker
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Start */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Learn how to use the IPO Checker in 4 easy steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Select IPO Company</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the IPO whose results you want to check from the dropdown menu. Only active IPOs with available results are shown.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Upload BOID Numbers</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV/Excel file containing BOID numbers, or paste them directly into the text area. The system will validate and remove duplicates automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Configure Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust the delay between checks, enable auto-retry, and select your CAPTCHA solving service. Click "Start Checking" when ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">View & Export Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor progress in real-time. Once complete, view detailed results, filter by status, and export to Excel or CSV.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Need More Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Report a Bug
              <ExternalLink className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
