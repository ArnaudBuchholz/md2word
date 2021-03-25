VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "IRenderer"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False

' Class Module IRenderer

Public Sub heading(level As String, text As String)
  Dim style
  If level = "1" Then
    style = "Heading 1"
  ElseIf level = "2" Then
    style = "Heading 2"
  ElseIf level = "3" Then
    style = "Heading 3"
  ElseIf level = "4" Then
    style = "Heading 4"
  End If

  Selection.TypeText text:=text
  Selection.MoveLeft Unit:=wdCharacter, Count:=Len(text), Extend:=wdExtend
  Selection.style = ActiveDocument.Styles(style)
  Selection.MoveRight
  Selection.TypeParagraph
End Sub

Public Sub text(text As String)
  Selection.TypeText text:=text
End Sub

Public Sub beginParagraph()
End Sub

Public Sub endParagraph()
  Selection.TypeParagraph
End Sub

Public Sub italic(text As String)
  Selection.TypeText text:=text
  Selection.MoveLeft Unit:=wdCharacter, Count:=Len(text), Extend:=wdExtend
  Selection.Font.italic = wdToggle
  Selection.MoveRight
  Selection.Font.italic = wdToggle
End Sub

Public Sub bold(text As String)
  Selection.TypeText text:=text
  Selection.MoveLeft Unit:=wdCharacter, Count:=Len(text), Extend:=wdExtend
  Selection.Font.bold = wdToggle
  Selection.MoveRight
  Selection.Font.bold = wdToggle
End Sub

