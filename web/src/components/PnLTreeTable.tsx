import {
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Collapse, Box, Typography
} from '@mui/material';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type Node = { name: string; value: number; children?: Node[] };
function Row({ node, depth = 0 }: { node: Node; depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasChildren = (node.children?.length || 0) > 0;

  return (
    <>
      <TableRow>
        <TableCell width={40}>
          {hasChildren && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Box pl={depth * 2}><Typography>{node.name}</Typography></Box>
        </TableCell>
<TableCell align="right">
  {(node.value ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
</TableCell>
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell sx={{ p: 0 }} colSpan={3}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box>
                {node.children!.map((c, i) => <Row key={i} node={c} depth={depth + 1} />)}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function PnLTreeTable({ tree }: { tree: Node[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Account</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tree.map((n, i) => <Row key={i} node={n} />)}
      </TableBody>
    </Table>
  );
}
