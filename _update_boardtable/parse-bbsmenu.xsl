<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" encoding="UTF-8"/>

  <xsl:template match="/">
nameTbl: {
<xsl:apply-templates select="/bbsmenu/category/board"/>
}
  </xsl:template>

  <xsl:template match="board">
    <xsl:if test="position() != 1">,
</xsl:if>
    "<xsl:value-of select="substring-after(substring-after(concat(@url, '|'), '://'), '|')"/>":"<xsl:value-of select="@title"/>"
  </xsl:template>
</xsl:stylesheet>
