<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
    <xsl:output method="html" doctype-public="XHTML/1.0 Transitional" 
                encoding="UTF-8" indent="yes" />

    <!-- Template for the root element -->
    <xsl:template match="/">
        <html>
            <head>
                <title>Sitemap | Ethnicity Calculator</title>
                <link rel="stylesheet" href="https://ethnicity-calculator.dankoresoft.com/styles.css" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon.png" />
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #004682; color: white; }
                    a { text-decoration: none; color: #004682; }
                    footer { margin-top: 20px; text-align: center; font-size: 0.9em; }
                    .icon-link { color: #007BFF; text-decoration: none; }
                    header { display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 10px 0; }
                    header img { margin-bottom: 10px; } 
                </style>
            </head>
            <body>
                <header>
                    <img src="https://ethnicity-calculator.dankoresoft.com/icons/android-icon-72x72.png" alt="Brand Logo" style="height: 60px;" />
                    <h1>Sitemap URLs</h1>
                </header>
                <table>
                    <tr>
                        <th>URL</th>
                        <th>Priority</th>
                    </tr>
                    <!-- Loop through each url element in the specified namespace -->
                    <xsl:for-each select="s:urlset/s:url">
                        <tr>
                            <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                            <td><xsl:value-of select="s:priority"/></td>
                        </tr>
                    </xsl:for-each>
                </table>
                <footer>
                    <p>Created by <a class="icon-link" href="https://www.dankoresoft.com/">Dankore Software LLC, USA</a> | Follow on <a
                        class="icon-link" href="https://twitter.com/dankoresoftware">Twitter</a></p>
                </footer>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
