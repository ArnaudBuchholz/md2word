Attribute VB_Name = "md2word"

Private Sub dispatch(instruction, renderer)
  Dim commandSep As Integer
  commandSep = InStr(instruction, " ")
  Dim command As String
  Dim parameter As String
  If commandSep <> 0 Then
    command = Left(instruction, commandSep - 1)
    parameter = Mid(instruction, commandSep + 1)
  Else
    command = instruction
    parameter = ""
  End If

  If command = "text" Then
    Call renderer.text(parameter)
  ElseIf command = "begin-paragraph" Then
    renderer.beginParagraph
  ElseIf command = "end-paragraph" Then
    renderer.endParagraph
  ElseIf command = "heading" Then
    Dim sep As Integer
    sep = InStr(parameter, " ")
    Dim level As String
    level = Left(parameter, sep - 1)
    parameter = Mid(parameter, sep + 1)
    renderer.heading level, parameter
  ElseIf command = "italic" Then
    Call renderer.italic(parameter)
  ElseIf command = "bold" Then
    Call renderer.bold(parameter)
  End If
  
End Sub


Sub receive(renderer As IRenderer)
  dispatch "heading 1 First heading", renderer
  dispatch "heading 2 Sub heading", renderer
  dispatch "begin-paragraph", renderer
  dispatch "text This is an ", renderer
  dispatch "italic example", renderer
  dispatch "text  of ", renderer
  dispatch "bold formatting", renderer
  dispatch "end-paragraph", renderer
End Sub

