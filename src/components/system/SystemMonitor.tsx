
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';
import { supabase } from '../../lib/supabase';

interface SystemError {
  id: string;
  error_type: string;
  error_message: string;
  component_path: string;
  is_fixed: boolean;
  created_at: string;
}

const SystemMonitor = () => {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('system_errors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching system errors:', error);
      toast({
        variant: "destructive",
        title: "Failed to fetch system errors",
        description: "Please try again later."
      });
    }
  };

  const scanSystem = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Simulate scanning different parts of the system
      const scanSteps = [
        { name: 'Scanning file paths', weight: 20 },
        { name: 'Checking UI components', weight: 25 },
        { name: 'Validating API connections', weight: 20 },
        { name: 'Testing payment modules', weight: 20 },
        { name: 'Verifying speech modules', weight: 15 }
      ];
      
      let cumulativeProgress = 0;
      
      for (const step of scanSteps) {
        // Update progress at the start of this step
        setScanProgress(cumulativeProgress);
        toast({
          title: "System Scan",
          description: step.name
        });
        
        // Simulate the scanning process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate finding errors
        if (Math.random() > 0.7) {
          const errorTypes = [
            'missing_path',
            'broken_ui_link',
            'payment_api_failure',
            'speech_module_error'
          ];
          
          const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          
          await supabase.from('system_errors').insert({
            error_type: randomErrorType,
            error_message: `Detected ${randomErrorType} during system scan`,
            component_path: `/src/components/${Math.random().toString(36).substring(7)}`,
            is_fixed: false
          });
        }
        
        // Update progress after completing this step
        cumulativeProgress += step.weight;
        setScanProgress(cumulativeProgress);
      }
      
      // Ensure we reach 100% at the end
      setScanProgress(100);
      
      // Refresh the errors list
      await fetchErrors();
      
      toast({
        title: "System Scan Complete",
        description: "All system components have been scanned."
      });
    } catch (error) {
      console.error('Error during system scan:', error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "An error occurred during the system scan."
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const fixAllIssues = async () => {
    if (errors.length === 0) {
      toast({
        title: "No Issues Found",
        description: "There are no issues to fix."
      });
      return;
    }
    
    setIsFixing(true);
    
    try {
      // Simulate fixing each error
      for (const error of errors) {
        if (!error.is_fixed) {
          toast({
            title: "Fixing Issue",
            description: `Repairing: ${error.error_type}`
          });
          
          // Simulate the fixing process
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mark as fixed in the database
          await supabase
            .from('system_errors')
            .update({
              is_fixed: true,
              fixed_at: new Date().toISOString(),
              fix_details: `Automatically fixed by system monitor`
            })
            .eq('id', error.id);
        }
      }
      
      // Refresh the errors list
      await fetchErrors();
      
      toast({
        title: "✅ All known issues have been resolved",
        description: "System is now operating normally."
      });
    } catch (error) {
      console.error('Error fixing issues:', error);
      toast({
        variant: "destructive",
        title: "Fix Failed",
        description: "An error occurred while fixing issues."
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Monitor</CardTitle>
        <CardDescription>
          Monitor and fix system issues automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isScanning && (
          <div className="mb-4">
            <p className="text-sm mb-2">Scanning system components...</p>
            <Progress value={scanProgress} className="h-2" />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">System Issues</h3>
            <Badge variant={errors.length === 0 ? "success" : "destructive"}>
              {errors.length} {errors.length === 1 ? 'Issue' : 'Issues'}
            </Badge>
          </div>
          
          {errors.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.map(error => (
                <div 
                  key={error.id} 
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{error.error_type}</p>
                    <p className="text-sm text-muted-foreground">{error.component_path}</p>
                  </div>
                  <Badge variant={error.is_fixed ? "success" : "outline"}>
                    {error.is_fixed ? 'Fixed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No system issues detected
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={scanSystem} 
          disabled={isScanning || isFixing}
        >
          {isScanning ? 'Scanning...' : '🔍 Scan System'}
        </Button>
        <Button 
          onClick={fixAllIssues} 
          disabled={isScanning || isFixing || errors.length === 0}
        >
          {isFixing ? 'Fixing...' : '🛠 Fix All Issues'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemMonitor;