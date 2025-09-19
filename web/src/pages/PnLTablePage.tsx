import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import dayjs from 'dayjs';

import { usePeriods, usePeriodTree } from '../api/hooks';
import PnLTreeTable from '../components/PnLTreeTable';
import IntegrationControls from '../components/IntegrationControls';

export default function PnLTablePage() {
  const [companyId, setCompanyId] = useState<string>('15151'); // default for the JSON2
  const { data: periods } = usePeriods(companyId);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // Set the first available period as default (normalized to first day of month)
  useEffect(() => {
    if (periods && periods.length > 0 && !selected) {
      setSelected(
        dayjs(periods[0].periodStart).startOf('month').format('YYYY-MM-DD')
      );
    }
  }, [periods]);

  const { data: treeData } = usePeriodTree(companyId, selected);
  const tree = treeData?.tree ?? [];

  return (
    <Container sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5">Profit & Loss</Typography>
        <IntegrationControls />
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl size="small">
              <InputLabel>Company</InputLabel>
              <Select
                label="Company"
                value={companyId}
                onChange={(e) => setCompanyId(String(e.target.value))}
              >
                <MenuItem value="15151">Company 15151</MenuItem>
                <MenuItem value="company-quickbooks">
                  QuickBooks Company
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Period Start</InputLabel>
              <Select
                label="Period Start"
                value={selected || ''}
                onChange={(e) => setSelected(String(e.target.value))}
              >
                {periods?.map((p: any) => {
                  const val = dayjs(p.periodStart)
                    .startOf('month')
                    .format('YYYY-MM-DD'); // value to send to API
                  const label = dayjs(p.periodStart).format('YYYY-MM'); // label for dropdown
                  return (
                    <MenuItem key={val} value={val}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>

          <PnLTreeTable tree={tree} />
        </Paper>
      </Stack>
    </Container>
  );
}
