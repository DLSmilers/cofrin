import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  MessageCircle,
  Share2,
  ChevronDown 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: number;
  valor: number;
  user: string;
  estabelecimento: string;
  detalhes: string;
  tipo: string;
  categoria: string;
  created_at: string;
  quando: string;
}

interface ExportButtonProps {
  transactions: Transaction[];
  userName: string;
  timeFilter: string;
}

export const ExportButton = ({ transactions, userName, timeFilter }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const generateReportText = () => {
    const now = new Date();
    const totalReceitas = transactions
      .filter(t => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalDespesas = transactions
      .filter(t => t.tipo === "despesa")
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saldo = totalReceitas - totalDespesas;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    let report = `📊 *RELATÓRIO FINANCEIRO*\n`;
    report += `👤 *Usuário:* ${userName}\n`;
    report += `📅 *Período:* ${timeFilter}\n`;
    report += `📈 *Gerado em:* ${now.toLocaleString("pt-BR")}\n\n`;
    
    report += `💰 *RESUMO FINANCEIRO*\n`;
    report += `├ 📈 Receitas: ${formatCurrency(totalReceitas)}\n`;
    report += `├ 📉 Despesas: ${formatCurrency(totalDespesas)}\n`;
    report += `└ 💵 Saldo: ${formatCurrency(saldo)}\n\n`;
    
    report += `📋 *TRANSAÇÕES (${transactions.length})*\n`;
    
    if (transactions.length > 0) {
      transactions.slice(0, 10).forEach((t, index) => {
        const emoji = t.tipo === "receita" ? "📈" : "📉";
        const valor = t.tipo === "receita" ? `+${formatCurrency(t.valor)}` : `-${formatCurrency(t.valor)}`;
        report += `${emoji} ${t.estabelecimento}\n`;
        report += `   ${valor} | ${t.categoria}\n`;
        report += `   ${formatDate(t.quando || t.created_at)}\n`;
        if (index < Math.min(9, transactions.length - 1)) report += `\n`;
      });
      
      if (transactions.length > 10) {
        report += `\n... e mais ${transactions.length - 10} transações\n`;
      }
    } else {
      report += `Nenhuma transação encontrada no período selecionado.\n`;
    }
    
    report += `\n🤖 _Relatório gerado pela automatizaí_`;
    
    return report;
  };

  const generateCSV = () => {
    const headers = ['Data', 'Estabelecimento', 'Valor', 'Tipo', 'Categoria', 'Detalhes'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.quando || t.created_at).toLocaleDateString("pt-BR"),
        `"${t.estabelecimento}"`,
        t.valor,
        t.tipo,
        `"${t.categoria}"`,
        `"${t.detalhes}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const reportText = generateReportText();
      downloadFile(reportText, `relatorio-financeiro-${new Date().getTime()}.txt`, 'text/plain');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV();
      downloadFile(csvContent, `transacoes-${new Date().getTime()}.csv`, 'text/csv');
    } finally {
      setIsExporting(false);
    }
  };

  const shareToWhatsApp = async () => {
    setIsExporting(true);
    try {
      const reportText = generateReportText();
      const encodedText = encodeURIComponent(reportText);
      
      // Para dispositivos mobile, usar o app do WhatsApp
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open(`whatsapp://send?text=${encodedText}`, '_blank');
      } else {
        // Para desktop, usar WhatsApp Web
        window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const shareNative = async () => {
    setIsExporting(true);
    try {
      const reportText = generateReportText();
      
      if (navigator.share) {
        await navigator.share({
          title: 'Relatório Financeiro - automatizaí',
          text: reportText,
        });
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(reportText);
        alert('Relatório copiado para a área de transferência!');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Exportar Dados</h3>
            <p className="text-sm text-muted-foreground">
              Compartilhe ou baixe seu relatório financeiro
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={isExporting}
                className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={shareToWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span>Enviar para WhatsApp</span>
                  <span className="text-xs text-muted-foreground">
                    Compartilhar relatório
                  </span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={shareNative}>
                <Share2 className="mr-2 h-4 w-4 text-blue-600" />
                <div className="flex flex-col">
                  <span>Compartilhar</span>
                  <span className="text-xs text-muted-foreground">
                    Usar compartilhamento nativo
                  </span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                <div className="flex flex-col">
                  <span>Baixar como TXT</span>
                  <span className="text-xs text-muted-foreground">
                    Arquivo de texto formatado
                  </span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span>Baixar como CSV</span>
                  <span className="text-xs text-muted-foreground">
                    Planilha de dados
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};