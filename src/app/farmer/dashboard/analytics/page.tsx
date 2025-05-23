
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SaleNotification } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowLeft, TrendingUp, DollarSign, Package, CalendarDays, FileText, Volume2 } from "lucide-react";
import Link from "next/link";
import { fetchSalesInsights } from "@/app/actions";
import type { SalesInsightsOutput } from "@/ai/flows/sales-insights-flow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS_PIE = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];
const FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX = "cropConnectFarmerNotifications_";


interface AggregatedProductSale {
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  numberOfSales: number;
}

interface DailySale {
    date: string;
    totalRevenue: number;
    totalItemsSold: number;
}


export default function SalesAnalyticsPage() {
  const { user } = useAuth();
  const { translate, language: currentLanguage } = useLanguage();
  const [notifications, setNotifications] = useState<SaleNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<SalesInsightsOutput | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [isSpeakingInsights, setIsSpeakingInsights] = useState(false);

  useEffect(() => {
    if (user && user.role === 'farmer') {
      setLoading(true);
      const farmerNotificationStoreKey = `${FARMER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`;
      const storedNotificationsString = localStorage.getItem(farmerNotificationStoreKey);
      if (storedNotificationsString) {
        try {
          const parsedNotifications: SaleNotification[] = JSON.parse(storedNotificationsString);
          setNotifications(parsedNotifications);
        } catch (e) {
          console.error("Error parsing farmer notifications for analytics", e);
          setNotifications([]);
        }
      } else {
        setNotifications([]); // Ensure notifications is an empty array if no data
      }
      setLoading(false);
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  const aggregatedSales = useMemo(() => {
    const productMap: Record<string, AggregatedProductSale> = {};
    notifications.forEach(notif => {
      notif.items.forEach(item => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = { 
            productName: item.productName, 
            totalQuantitySold: 0, 
            totalRevenue: 0,
            numberOfSales: 0
          };
        }
        productMap[item.productName].totalQuantitySold += item.quantity;
        productMap[item.productName].totalRevenue += item.quantity * item.pricePerUnit;
        productMap[item.productName].numberOfSales +=1;
      });
    });
    return Object.values(productMap).sort((a,b) => b.totalRevenue - a.totalRevenue);
  }, [notifications]);

  const dailySalesData = useMemo(() => {
    const salesByDate: Record<string, DailySale> = {};
    notifications.forEach(notif => {
        const date = new Date(notif.date).toISOString().split('T')[0]; // YYYY-MM-DD
        if(!salesByDate[date]){
            salesByDate[date] = { date, totalRevenue: 0, totalItemsSold: 0};
        }
        salesByDate[date].totalRevenue += notif.totalAmount;
        salesByDate[date].totalItemsSold += notif.items.reduce((sum, item) => sum + item.quantity, 0);
    });
    return Object.values(salesByDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [notifications]);

  const totalRevenue = useMemo(() => aggregatedSales.reduce((sum, s) => sum + s.totalRevenue, 0), [aggregatedSales]);
  const totalItemsSold = useMemo(() => aggregatedSales.reduce((sum, s) => sum + s.totalQuantitySold, 0), [aggregatedSales]);
  const uniqueProductsSold = useMemo(() => aggregatedSales.length, [aggregatedSales]);

  const handleFetchInsights = async () => {
    if (notifications.length === 0) { // Check notifications directly
        setInsightsError(translate('noSalesDataForInsights', "No sales data available to generate insights."));
        return;
    }
    setLoadingInsights(true);
    setInsightsError(null);
    setAiInsights(null);
     if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeakingInsights(false);
    }

    const simplifiedSalesData = notifications.map(n => ({
        orderId: n.orderId.substring(0,10),
        customerName: n.customerName, 
        totalAmount: n.totalAmount,
        date: new Date(n.date).toISOString().split('T')[0],
        items: n.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit
        }))
    }));

    const result = await fetchSalesInsights({ 
        salesDataJson: JSON.stringify(simplifiedSalesData), 
        timePeriod: translate('allTime', "All Time"),
        language: currentLanguage 
    });
    if ("error" in result) {
      setInsightsError(result.error);
    } else {
      setAiInsights(result);
    }
    setLoadingInsights(false);
  };

  const handleReadAloudInsights = () => {
    if (!aiInsights || typeof window === "undefined" || !window.speechSynthesis) {
      setInsightsError(translate('speechNotSupportedError', "Text-to-speech is not supported in your browser."));
      return;
    }

    if (isSpeakingInsights) {
      window.speechSynthesis.cancel();
      setIsSpeakingInsights(false);
      return;
    }

    let textToSpeak = `${translate('overallSummary', 'Overall Summary')}. ${aiInsights.overallSummary}. `;
    textToSpeak += `${translate('keyInsights', 'Key Insights')}. ${aiInsights.keyInsights.join('. ')}. `;
    textToSpeak += `${translate('actionableRecommendations', 'Actionable Recommendations')}. ${aiInsights.actionableRecommendations.join('. ')}. `;
    if (aiInsights.demandForecast) {
      textToSpeak += `${translate('demandForecast', 'Demand Forecast')}. ${aiInsights.demandForecast}. `;
    }
    if (aiInsights.seasonalTrends) {
      textToSpeak += `${translate('seasonalTrends', 'Seasonal Trends')}. ${aiInsights.seasonalTrends}. `;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langCode = currentLanguage.split('-')[0];
    utterance.lang = langCode;

    utterance.onstart = () => {
      setIsSpeakingInsights(true);
      setInsightsError(null);
    };

    utterance.onend = () => {
      setIsSpeakingInsights(false);
    };

    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log(`Sales insights speech (lang: ${langCode}) was intentionally stopped.`);
        setIsSpeakingInsights(false);
        return;
      }
      console.error(`Sales insights speech error (lang: ${langCode}):`, event.error, event);
      setInsightsError(translate('speechError', "Sorry, I couldn't read insights aloud."));
      setIsSpeakingInsights(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeakingInsights(false);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{translate('loadingAnalytics', 'Loading sales analytics...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <TrendingUp className="mr-3 h-8 w-8 text-primary" />
          {translate('salesAnalyticsTitle', 'Sales Analytics')}
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/farmer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {translate('backToDashboard', 'Back to Dashboard')}
          </Link>
        </Button>
      </div>

      {notifications.length === 0 ? (
         <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold">{translate('noSalesData', "No sales data available yet.")}</p>
                <p className="text-muted-foreground">{translate('salesDataAppearHere', 'Once you have sales, your analytics will appear here.')}</p>
            </CardContent>
        </Card>
      ) : (
        <>
            {/* Key Metrics Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{translate('totalRevenue', 'Total Revenue')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{translate('totalItemsSold', 'Total Items Sold')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItemsSold}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{translate('uniqueProductsSold', 'Unique Products Sold')}</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueProductsSold}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{translate('revenueByProduct', 'Revenue by Product')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedSales.slice(0,5)} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="productName" angle={-15} textAnchor="end" height={50} interval={0} />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="totalRevenue" name={translate('revenue', 'Revenue')} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{translate('quantitySoldByProduct', 'Quantity Sold by Product (Top 5)')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={aggregatedSales.slice(0,5)} dataKey="totalQuantitySold" nameKey="productName" cx="50%" cy="50%" outerRadius={100} label>
                                    {aggregatedSales.slice(0,5).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => `${value} units`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>{translate('dailySalesTrend', 'Daily Sales Trend (Revenue)')}</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailySalesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Line type="monotone" dataKey="totalRevenue" name={translate('totalRevenue', 'Total Revenue')} stroke="var(--color-chart-2)" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>


            {/* AI Sales Insights Section */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="mr-3 h-6 w-6 text-primary"/>
                        {translate('aiSalesInsightsTitle', 'AI Sales Insights & Recommendations')}
                    </CardTitle>
                    <CardDescription>
                        {translate('aiSalesInsightsDesc', 'Let AI analyze your sales data for actionable advice.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleFetchInsights} disabled={loadingInsights || notifications.length === 0} className="w-full sm:w-auto mb-4">
                        {loadingInsights && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {translate('getAIInsightsButton', 'Generate AI Insights')}
                    </Button>
                    {insightsError && (
                        <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5"/> <p>{insightsError}</p>
                        </div>
                    )}
                    {aiInsights && !insightsError && (
                        <Card className="mt-2 p-4 bg-primary/5 border border-primary/20 space-y-3">
                            <div>
                                <h4 className="font-semibold text-md text-primary mb-1">{translate('overallSummary', 'Overall Summary')}</h4>
                                <p className="text-sm">{aiInsights.overallSummary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-md text-primary mb-1">{translate('keyInsights', 'Key Insights')}</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {aiInsights.keyInsights.map((insight, i) => <li key={`insight-${i}`}>{insight}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-md text-primary mb-1">{translate('actionableRecommendations', 'Actionable Recommendations')}</h4>
                                 <ul className="list-disc list-inside text-sm space-y-1">
                                    {aiInsights.actionableRecommendations.map((rec, i) => <li key={`rec-${i}`}>{rec}</li>)}
                                </ul>
                            </div>
                            {aiInsights.demandForecast && (
                               <div>
                                <h4 className="font-semibold text-md text-primary mb-1">{translate('demandForecast', 'Demand Forecast')}</h4>
                                <p className="text-sm">{aiInsights.demandForecast}</p>
                               </div>
                            )}
                            {aiInsights.seasonalTrends && (
                               <div>
                                <h4 className="font-semibold text-md text-primary mb-1">{translate('seasonalTrends', 'Seasonal Trends')}</h4>
                                <p className="text-sm">{aiInsights.seasonalTrends}</p>
                               </div>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleReadAloudInsights}
                                className="mt-4 w-full"
                            >
                                <Volume2 className="mr-2 h-4 w-4" /> 
                                {isSpeakingInsights ? translate('stopReading', 'Stop Reading') : translate('readAloudInsights', 'Read Insights Aloud')}
                            </Button>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{translate('detailedProductSales', 'Detailed Product Sales')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{translate('productName', 'Product Name')}</TableHead>
                                <TableHead className="text-right">{translate('quantitySold', 'Quantity Sold')}</TableHead>
                                <TableHead className="text-right">{translate('totalRevenue', 'Total Revenue')}</TableHead>
                                <TableHead className="text-right">{translate('numberOfSales', 'Number of Sales')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aggregatedSales.map(sale => (
                                <TableRow key={sale.productName}>
                                    <TableCell className="font-medium">{sale.productName}</TableCell>
                                    <TableCell className="text-right">{sale.totalQuantitySold}</TableCell>
                                    <TableCell className="text-right">${sale.totalRevenue.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{sale.numberOfSales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}

    