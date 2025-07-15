import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  ExpandMore,
  Link as LinkIcon,
  Analytics,
  Launch,
  Schedule,
  LocationOn,
  Mouse,
  CalendarToday
} from '@mui/icons-material';

// Logging Middleware
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    // Store logs in memory for this session
    if (!window.appLogs) {
      window.appLogs = [];
    }
    window.appLogs.push(logEntry);
    
    // Also output to console for debugging
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
  }
  
  static info(message, data) {
    this.log('INFO', message, data);
  }
  
  static warn(message, data) {
    this.log('WARN', message, data);
  }
  
  static error(message, data) {
    this.log('ERROR', message, data);
  }
  
  static debug(message, data) {
    this.log('DEBUG', message, data);
  }
}

// Utility functions
const generateShortcode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidShortcode = (shortcode) => {
  return /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

const URLShortenerApp = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [urls, setUrls] = useState([
    { id: 1, originalUrl: '', customShortcode: '', validity: '' },
    { id: 2, originalUrl: '', customShortcode: '', validity: '' },
    { id: 3, originalUrl: '', customShortcode: '', validity: '' },
    { id: 4, originalUrl: '', customShortcode: '', validity: '' },
    { id: 5, originalUrl: '', customShortcode: '', validity: '' }
  ]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectDialog, setRedirectDialog] = useState({ open: false, url: '' });

  // Load data from memory on component mount
  useEffect(() => {
    Logger.info('URL Shortener App initialized');
    if (window.shortenedUrlsData) {
      setShortenedUrls(window.shortenedUrlsData);
    }
  }, []);

  // Save data to memory whenever shortenedUrls changes
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      window.shortenedUrlsData = shortenedUrls;
      Logger.debug('Shortened URLs data saved to memory', { count: shortenedUrls.length });
    }
  }, [shortenedUrls]);

  // Handle URL input changes
  const handleUrlChange = (id, field, value) => {
    Logger.debug(`URL input changed: ${field}`, { id, value });
    setUrls(prev => prev.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
    
    // Clear errors for this field
    setErrors(prev => ({
      ...prev,
      [`${id}-${field}`]: ''
    }));
  };

  // Validate input
  const validateInput = (url) => {
    const newErrors = {};
    
    if (!url.originalUrl) {
      newErrors.originalUrl = 'Original URL is required';
    } else if (!isValidUrl(url.originalUrl)) {
      newErrors.originalUrl = 'Please enter a valid URL';
    }
    
    if (url.validity && (!Number.isInteger(Number(url.validity)) || Number(url.validity) <= 0)) {
      newErrors.validity = 'Validity must be a positive integer (minutes)';
    }
    
    if (url.customShortcode && !isValidShortcode(url.customShortcode)) {
      newErrors.customShortcode = 'Shortcode must be 3-10 alphanumeric characters';
    }
    
    return newErrors;
  };

  // Check if shortcode is unique
  const isShortcodeUnique = (shortcode) => {
    return !shortenedUrls.some(url => url.shortcode === shortcode);
  };

  // Handle form submission
  const handleSubmit = () => {
    Logger.info('Form submission started');
    const urlsToProcess = urls.filter(url => url.originalUrl);
    
    if (urlsToProcess.length === 0) {
      setErrors({ general: 'Please enter at least one URL' });
      Logger.warn('No URLs provided for shortening');
      return;
    }
    
    const allErrors = {};
    const newShortenedUrls = [];
    
    urlsToProcess.forEach(url => {
      const validationErrors = validateInput(url);
      
      if (Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, error]) => {
          allErrors[`${url.id}-${field}`] = error;
        });
        return;
      }
      
      // Generate or use custom shortcode
      let shortcode = url.customShortcode || generateShortcode();
      
      // Ensure uniqueness
      while (!isShortcodeUnique(shortcode)) {
        if (url.customShortcode) {
          allErrors[`${url.id}-customShortcode`] = 'This shortcode is already taken';
          return;
        }
        shortcode = generateShortcode();
      }
      
      // Set validity (default 30 minutes)
      const validityMinutes = parseInt(url.validity) || 30;
      const expiryDate = new Date(Date.now() + validityMinutes * 60 * 1000);
      
      const shortenedUrl = {
        id: Date.now() + Math.random(),
        originalUrl: url.originalUrl,
        shortcode,
        shortUrl: `http://localhost:3000/${shortcode}`,
        createdAt: new Date(),
        expiryDate,
        clickCount: 0,
        clicks: []
      };
      
      newShortenedUrls.push(shortenedUrl);
      Logger.info('URL shortened successfully', { 
        shortcode, 
        originalUrl: url.originalUrl,
        expiryDate: expiryDate.toISOString()
      });
    });
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      Logger.error('Validation errors occurred', allErrors);
      return;
    }
    
    setShortenedUrls(prev => [...prev, ...newShortenedUrls]);
    setSuccessMessage(`Successfully shortened ${newShortenedUrls.length} URL(s)`);
    setErrors({});
    
    // Reset form
    setUrls([
      { id: 1, originalUrl: '', customShortcode: '', validity: '' },
      { id: 2, originalUrl: '', customShortcode: '', validity: '' },
      { id: 3, originalUrl: '', customShortcode: '', validity: '' },
      { id: 4, originalUrl: '', customShortcode: '', validity: '' },
      { id: 5, originalUrl: '', customShortcode: '', validity: '' }
    ]);
    
    Logger.info('Form submission completed successfully', { 
      urlsProcessed: newShortenedUrls.length 
    });
  };

  // Handle shortcode click (redirect)
  const handleShortcodeClick = (shortenedUrl) => {
    Logger.info('Shortcode clicked', { shortcode: shortenedUrl.shortcode });
    
    // Check if URL is expired
    if (new Date() > new Date(shortenedUrl.expiryDate)) {
      setErrors({ general: 'This shortened URL has expired' });
      Logger.warn('Attempted to access expired URL', { shortcode: shortenedUrl.shortcode });
      return;
    }
    
    // Record click
    const clickData = {
      timestamp: new Date(),
      source: 'Direct Click',
      location: 'Demo Location (San Francisco, CA)', // Demo data as requested
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    };
    
    setShortenedUrls(prev => prev.map(url => 
      url.id === shortenedUrl.id 
        ? { 
            ...url, 
            clickCount: url.clickCount + 1,
            clicks: [...url.clicks, clickData]
          }
        : url
    ));
    
    Logger.info('Click recorded', { 
      shortcode: shortenedUrl.shortcode,
      clickCount: shortenedUrl.clickCount + 1
    });
    
    setRedirectDialog({ open: true, url: shortenedUrl.originalUrl });
  };

  // Handle redirect confirmation
  const handleRedirectConfirm = () => {
    window.open(redirectDialog.url, '_blank');
    setRedirectDialog({ open: false, url: '' });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    Logger.info('URL copied to clipboard', { url: text });
  };

  // Delete shortened URL
  const deleteUrl = (id) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
    Logger.info('URL deleted', { id });
  };

  // Get active URLs (non-expired)
  const getActiveUrls = () => {
    return shortenedUrls.filter(url => new Date() <= new Date(url.expiryDate));
  };

  // Get expired URLs
  const getExpiredUrls = () => {
    return shortenedUrls.filter(url => new Date() > new Date(url.expiryDate));
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab icon={<LinkIcon />} label="Shorten URLs" />
            <Tab icon={<Analytics />} label="Statistics" />
          </Tabs>

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}
          {errors.general && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {/* URL Shortener Tab */}
          {currentTab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Shorten Your URLs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter up to 5 URLs to shorten. Default validity is 30 minutes.
              </Typography>

              {urls.map((url) => (
                <Card key={url.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Original URL"
                          placeholder="https://example.com/very-long-url"
                          value={url.originalUrl}
                          onChange={(e) => handleUrlChange(url.id, 'originalUrl', e.target.value)}
                          error={!!errors[`${url.id}-originalUrl`]}
                          helperText={errors[`${url.id}-originalUrl`]}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Custom Shortcode (Optional)"
                          placeholder="mycode"
                          value={url.customShortcode}
                          onChange={(e) => handleUrlChange(url.id, 'customShortcode', e.target.value)}
                          error={!!errors[`${url.id}-customShortcode`]}
                          helperText={errors[`${url.id}-customShortcode`]}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Validity (Minutes)"
                          placeholder="30"
                          type="number"
                          value={url.validity}
                          onChange={(e) => handleUrlChange(url.id, 'validity', e.target.value)}
                          error={!!errors[`${url.id}-validity`]}
                          helperText={errors[`${url.id}-validity`]}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  sx={{ px: 4 }}
                >
                  Shorten URLs
                </Button>
              </Box>

              {/* Results */}
              {shortenedUrls.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Shortened URLs
                  </Typography>
                  {getActiveUrls().map((url) => (
                    <Card key={url.id} sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Original URL:
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                              {url.originalUrl}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Shortened URL:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleShortcodeClick(url)}
                                startIcon={<Launch />}
                              >
                                {url.shortUrl}
                              </Button>
                              <IconButton onClick={() => copyToClipboard(url.shortUrl)}>
                                <ContentCopy />
                              </IconButton>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Expires:
                            </Typography>
                            <Chip
                              icon={<Schedule />}
                              label={formatDateTime(url.expiryDate)}
                              color="warning"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Statistics Tab */}
          {currentTab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                URL Statistics
              </Typography>

              {shortenedUrls.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No URLs shortened yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Go to the "Shorten URLs" tab to create your first shortened URL.
                  </Typography>
                </Card>
              ) : (
                <>
                  {/* Active URLs */}
                  {getActiveUrls().length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom color="success.main">
                        Active URLs ({getActiveUrls().length})
                      </Typography>
                      {getActiveUrls().map((url) => (
                        <Accordion key={url.id} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={4}>
                                <Button
                                  variant="text"
                                  onClick={() => handleShortcodeClick(url)}
                                  startIcon={<Launch />}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {url.shortUrl}
                                </Button>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Mouse />
                                  <Typography variant="body2">
                                    {url.clickCount} clicks
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Schedule />
                                  <Typography variant="body2">
                                    Expires: {formatDateTime(url.expiryDate)}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  URL Details
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText
                                      primary="Original URL"
                                      secondary={url.originalUrl}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText
                                      primary="Created"
                                      secondary={formatDateTime(url.createdAt)}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText
                                      primary="Total Clicks"
                                      secondary={url.clickCount}
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Click History
                                </Typography>
                                {url.clicks.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    No clicks yet
                                  </Typography>
                                ) : (
                                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Timestamp</TableCell>
                                          <TableCell>Location</TableCell>
                                          <TableCell>Source</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {url.clicks.map((click, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{formatDateTime(click.timestamp)}</TableCell>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOn fontSize="small" />
                                                {click.location}
                                              </Box>
                                            </TableCell>
                                            <TableCell>{click.source}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                )}
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                              <IconButton
                                onClick={() => copyToClipboard(url.shortUrl)}
                                color="primary"
                              >
                                <ContentCopy />
                              </IconButton>
                              <IconButton
                                onClick={() => deleteUrl(url.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}

                  {/* Expired URLs */}
                  {getExpiredUrls().length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom color="error.main">
                        Expired URLs ({getExpiredUrls().length})
                      </Typography>
                      {getExpiredUrls().map((url) => (
                        <Card key={url.id} sx={{ mb: 1, backgroundColor: '#fafafa' }}>
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                  {url.shortUrl}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="body2">
                                  {url.clickCount} clicks
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="error">
                                    Expired: {formatDateTime(url.expiryDate)}
                                  </Typography>
                                  <IconButton
                                    onClick={() => deleteUrl(url.id)}
                                    color="error"
                                    size="small"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Redirect Dialog */}
      <Dialog open={redirectDialog.open} onClose={() => setRedirectDialog({ open: false, url: '' })}>
        <DialogTitle>Redirect Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to be redirected to:
          </Typography>
          <Typography sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, wordBreak: 'break-all' }}>
            {redirectDialog.url}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedirectDialog({ open: false, url: '' })}>
            Cancel
          </Button>
          <Button onClick={handleRedirectConfirm} variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default URLShortenerApp;