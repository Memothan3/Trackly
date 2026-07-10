import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useTrackly } from "@/contexts/trackly-provider";
import { Calendar, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

export function TransactionsPage() {
  const { transactions, accounts, currency, refresh } = useTrackly();
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [transactionReceiptData, setTransactionReceiptData] = useState<{ base64: string; fileName: string; fileType: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense" | "transfer",
    amount: "",
    account: "",
    toAccount: "",
    category: "",
    reason: "",
    date: "",
    note: "",
  });

  // Handle file upload for receipt
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast("Unsupported file type. Please upload PDF, JPG, PNG, DOC, or DOCX files.", {
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        setTransactionReceiptData({
          base64: reader.result.split(",")[1], // Remove data URL prefix
          fileName: file.name,
          fileType: file.type,
        });
        toast("Receipt uploaded successfully");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast("Enter a valid amount.", { variant: "destructive" });
      return;
    }
    if (!formData.reason.trim()) {
      toast("A reason is required.", { variant: "destructive" });
      return;
    }
    if (!formData.account) {
      toast("Select an account.", { variant: "destructive" });
      return;
    }
    if (formData.type === "transfer" && (!formData.toAccount || formData.toAccount === formData.account)) {
      toast("Select a different destination account.", { variant: "destructive" });
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === formData.account);
    const toAcct = accounts.find((a) => a.id === formData.toAccount);
    const txnCurrency = (selectedAccount?.currency || currency).toUpperCase();
    const txnNote = formData.type === "transfer"
      ? `\u2192 ${toAcct?.name || "account"}${formData.note ? " \u00b7 " + formData.note : ""}`
      : formData.note || null;
    const txnDate = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          account_id: formData.account,
          category_id: formData.category || null,
          type: formData.type,
          amount: parseFloat(formData.amount),
          currency: txnCurrency,
          reason: formData.reason.trim(),
          note: txnNote,
          date: txnDate,
        })
        .select();

      if (error) throw error;

      // Save receipt if attached
      if (transactionReceiptData && data?.[0]) {
        const { data: receiptData, error: receiptError } = await supabase
          .from("receipts")
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            transaction_id: data[0].id,
            type: "payment",
            image_url: transactionReceiptData.base64,
            extracted_data: null,
            ai_processed: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (receiptError) {
          console.error("Receipt save error:", receiptError);
          toast("Transaction saved, but receipt failed to save", { variant: "destructive" });
        } else {
          toast("Receipt saved and linked to transaction");
          // Trigger AI processing (simplified)
          setTimeout(async () => {
            try {
              // In a real app, you would call your AI processing function here
              console.log("AI processing would happen here for receipt:", receiptData.id);
            } catch (aiError) {
              console.error("AI processing error:", aiError);
            }
          }, 1000);
        }
      }

      // Reset form and close modal
      setFormData({
        type: "expense",
        amount: "",
        account: "",
        toAccount: "",
        category: "",
        reason: "",
        date: "",
        note: "",
      });
      setTransactionReceiptData(null);
      setShowAddTransactionModal(false);
      await refresh();

      toast("Transaction saved successfully");
    } catch (err) {
      console.error("Transaction save error:", err);
      toast("Error saving transaction", { variant: "destructive" });
    }
  };

  // Handle transaction row click to show details
  const handleTransactionClick = (id: string) => {
    setSelectedTransactionId(id);
  };

  // Render transaction details modal
  const renderTransactionDetails = () => {
    if (!selectedTransactionId) return null;

    const transaction = transactions.find((t) => t.id === selectedTransactionId);
    if (!transaction) return null;

    // Fetch receipt for this transaction
    const [receipt] = transactions
      .map((t) => t.id)
      .filter((id) => id === selectedTransactionId)
      .map(async (id) => {
        const { data } = await supabase.from("receipts").select("*").eq("transaction_id", id).single();
        return data;
      });

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="hidden" /> {/* Hidden trigger for programmatic opening */}
        </DialogTrigger>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details of the selected transaction
            </DialogDescription>
          </DialogHeader>
          {/* Transaction details would go here - simplified for now */}
          <div className="space-y-4">
            <div>
              <p className="font-medium">Amount: {transaction.amount} {transaction.currency || ""}</p>
              <p>Type: {transaction.type}</p>
              <p>Account: {transaction.accounts?.name || "—"}</p>
              <p>Category: {transaction.categories?.name || "—"}</p>
              <p>Date: {format(parseISO(transaction.date), "PPpp")}</p>
              {transaction.note && (
                <div className="mt-2">
                  <p className="font-medium">Note:</p>
                  <p>{transaction.note}</p>
                </div>
              )}
            </div>
            {/* Receipt section would go here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransactionId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button variant="outline" onClick={() => setShowAddTransactionModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardCaption>
            Showing {transactions.length} transactions
          </CardCaption>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableCaption>
                Recent transactions (most recent first)
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Date</TableHead>
                  <TableHead className="w-16">Amount</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-16">Type</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow
                    key={txn.id}
                    onClick={() => handleTransactionClick(txn.id)}
                    className="cursor-pointer hover:bg-muted hover:transition-colors"
                  >
                    <TableCell>
                      {format(parseISO(txn.date), "PPp")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {txn.amount} {txn.currency || ""}
                    </TableCell>
                    <TableCell>
                      {txn.accounts?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {txn.categories?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      {/* Action buttons would go here */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="hidden" /> {/* Hidden trigger */}
        </DialogTrigger>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new income, expense, or transfer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="txn-type">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="txn-amount">Amount</Label>
                <Input
                  id="txn-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  name="amount"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="txn-account">Account</Label>
                <Select
                  value={formData.account}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, account: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className={formData.type === "transfer" ? "block" : "hidden"}
              >
                <Label htmlFor="txn-to-account">To Account</Label>
                <Select
                  value={formData.toAccount}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, toAccount: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((acc) => acc.id !== formData.account)
                      .map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="txn-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {/* In a real app, you would fetch categories from Supabase */}
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="bills">Bills & Utilities</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="txn-date">Date</Label>
                <Input
                  id="txn-date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="txn-reason">Reason</Label>
              <Input
                id="txn-reason"
                value={formData.reason}
                onChange={handleInputChange}
                name="reason"
                placeholder="Reason for transaction"
                required
              />
            </div>

            <div>
              <Label htmlFor="txn-note">Note (optional)</Label>
              <Textarea
                id="txn-note"
                value={formData.note}
                onChange={handleInputChange}
                name="note"
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            {/* Receipt Upload Section */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Upload className="mr-2 h-4 w-4" />
                <span className="font-medium">Attach Receipt</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                onChange={handleReceiptUpload}
                className="block w-full text-sm text-muted-foreground"
              />
              {transactionReceiptData && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <p className="font-medium">Attached:</p>
                  <p className="text-sm">{transactionReceiptData.fileName}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddTransactionModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      {renderTransactionDetails()}
    </div>
  );
}