import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Button,
  Box,
  Stack,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
  Tooltip,
  Chip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import SummarizeIcon from "@mui/icons-material/Summarize";
import axios from "axios";
import "./App.css";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [summaryLength, setSummaryLength] = useState("short");

  const [generatedReply, setGeneratedReply] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");

  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // banner image (uploaded file). Tooling will transform this local path to a URL.
  const bannerUrl = "/mnt/data/a27b353d-4dfb-4595-ad91-41a62da8b8e1.png";

  // ---------------------------
  // Generate Reply
  // ---------------------------
  const handleGenerateReply = async () => {
    setGeneratedReply("");
    setErrorMessage("");
    setLoadingReply(true);

    try {
      const resp = await axios.post(`${baseUrl}/generate`, {
        emailContent,
        tone,
      });

      const data = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data, null, 2);
      setGeneratedReply(data);
      setSnackMsg("Reply generated");
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to generate reply. See console for details.");
      setSnackMsg("Failed to generate reply");
      setSnackOpen(true);
    } finally {
      setLoadingReply(false);
    }
  };

  // ---------------------------
  // Summarize Email
  // ---------------------------
  const handleSummarize = async () => {
    setGeneratedSummary("");
    setErrorMessage("");
    setLoadingSummary(true);

    try {
      const resp = await axios.post(`${baseUrl}/summarize`, {
        emailContent,
        summaryLength,
      });

      const data = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data, null, 2);
      setGeneratedSummary(data);
      setSnackMsg("Summary generated");
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to summarize. See console for details.");
      setSnackMsg("Failed to summarize");
      setSnackOpen(true);
    } finally {
      setLoadingSummary(false);
    }
  };

  // ---------------------------
  // Copy to Clipboard
  // ---------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setSnackMsg("Copied to clipboard");
      setSnackOpen(true);
    } catch (err) {
      console.error("Clipboard error:", err);
      setErrorMessage("Failed to copy to clipboard.");
      setSnackMsg("Copy failed");
      setSnackOpen(true);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar sx={{ gap: 2 }}>
          <Avatar sx={{ bgcolor: "white" }}>
            <EmailIcon color="primary" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Email Assistant
            </Typography>
            <Typography variant="caption" color="inherit">
              AI-powered replies & summaries — fast and professional
            </Typography>
          </Box>

          <Button
            color="inherit"
            startIcon={<SummarizeIcon />}
            href="#try"
            sx={{ textTransform: "none" }}
          >
            Try it
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="section"
        sx={{
          backgroundImage: `linear-gradient(rgba(174, 182, 193, 0.5), rgba(216, 220, 226, 0.5)), url("${bannerUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "black",
          py: { xs: 6, md: 10 },
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Write better emails in seconds
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, mb: 2 }}>
            Generate professional replies or concise summaries powered by AI.
          </Typography>

          <Paper
  sx={{
    mt: 3,
    p: 2,
    background: "rgba(0, 0, 0, 0.25)",  // <— darker grey
    borderRadius: "10px",
  }}
>
  <Typography variant="body2" sx={{ color: "#0a0a0aff", fontSize: "0.95rem" }}>
    Tip: Paste the message you received in the mail box below, choose a tone,
    and click <strong>Generate Reply</strong> or <strong>Summarize</strong>.
  </Typography>
</Paper>
        </Container>
      </Box>

      <Container id="try" maxWidth="md" sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Original Email
                </Typography>

                <TextField
                  placeholder="Paste the original email here..."
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Tone (Optional)</InputLabel>
                    <Select value={tone} label="Tone (Optional)" onChange={(e) => setTone(e.target.value)}>
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="professional">Professional</MenuItem>
                      <MenuItem value="casual">Casual</MenuItem>
                      <MenuItem value="friendly">Friendly</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Summary length</InputLabel>
                    <Select value={summaryLength} label="Summary length" onChange={(e) => setSummaryLength(e.target.value)}>
                      <MenuItem value="short">Short</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="long">Long / Detailed</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: "flex", gap: 1, mt: { xs: 1, sm: 0 } }}>
                    <Button
                      variant="contained"
                      onClick={handleGenerateReply}
                      disabled={!emailContent || loadingReply}
                      startIcon={<EmailIcon />}
                    >
                      {loadingReply ? <CircularProgress size={18} color="inherit" /> : "Generate Reply"}
                    </Button>

                    <Button variant="outlined" onClick={handleSummarize} disabled={!emailContent || loadingSummary} startIcon={<SummarizeIcon />}>
                      {loadingSummary ? <CircularProgress size={18} /> : "Summarize"}
                    </Button>
                  </Box>
                </Stack>

                {errorMessage && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="error">{errorMessage}</Alert>
                  </Box>
                )}
              </CardContent>
            </Card>

           
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <Card elevation={4}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <EmailIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">Generated Reply</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your generated email reply will appear here. Review it and use the copy button to quickly paste it into your mail client.                                                 
                      </Typography>
                    </Box>
                  </Stack>

                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    variant="outlined"
                    value={generatedReply}
                    inputProps={{ readOnly: true }}
                    sx={{ mt: 2 }}
                  />

                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Tooltip title="Copy reply">
                      <IconButton color="primary" onClick={() => copyToClipboard(generatedReply)} disabled={!generatedReply}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" onClick={() => setGeneratedReply("")}>
                      Clear
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>

              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <SummarizeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">Generated Summary</Typography>
                      <Typography variant="caption" color="text.secondary">
                        The generated summary will appear in this section, giving you a clear breakdown of the important points.
                      </Typography>
                    </Box>
                  </Stack>

                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    variant="outlined"
                    value={generatedSummary}
                    inputProps={{ readOnly: true }}
                    sx={{ mt: 2 }}
                  />

                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Tooltip title="Copy summary">
                      <IconButton color="primary" onClick={() => copyToClipboard(generatedSummary)} disabled={!generatedSummary}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" onClick={() => setGeneratedSummary("")}>
                      Clear
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Box component="footer" sx={{ py: 4, backgroundColor: "#fafafa", borderTop: "1px solid #eee" }}>
        <Container maxWidth="md">
          <Typography variant="body1" color="text.secondary">
            AI Email Assistant — crafted for efficiency ⚡ engineered for accuracy 🤖 designed to elevate your workflow ✨
          </Typography>
        </Container>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2500} onClose={() => setSnackOpen(false)} message={snackMsg} />
    </>
  );
}

export default App;
