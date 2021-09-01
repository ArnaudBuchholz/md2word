
Private Sub dispatch(instruction)
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

  If command = "type" Then
    Dim line
    Dim count
    count = 0
    For Each line In Split(parameter, "%N")
      If count > 0 Then
        Selection.TypeText text:=Chr(11)
      End If
      Selection.TypeText text:=Replace(line, "%%", "%")
      count = count + 1
    Next line
  ElseIf command = "left" Then
    Selection.MoveLeft Unit:=wdCharacter, count:=CInt(parameter)
  ElseIf command = "right" Then
    Selection.MoveRight Unit:=wdCharacter, count:=CInt(parameter)
  ElseIf command = "enter" Then
    Selection.MoveRight
    Selection.TypeParagraph
    Selection.style = ActiveDocument.Styles("Normal")
  ElseIf command = "select" Then
    Selection.MoveRight Unit:=wdCharacter, count:=CInt(parameter), Extend:=wdExtend
  ElseIf command = "format" Then
    Dim style As String
    If parameter = "header1" Then
      style = wdStyleHeading1
    ElseIf parameter = "header2" Then
      style = wdStyleHeading2
    ElseIf parameter = "header3" Then
      style = wdStyleHeading3
    ElseIf parameter = "header4" Then
      style = wdStyleHeading4
    ElseIf parameter = "italic" Then
      Selection.Font.Italic = wdToggle
    ElseIf parameter = "bold" Then
      Selection.Font.Bold = wdToggle
    ElseIf InStr(1, parameter, "code ") = 1 Then
      Selection.Font.Name = "Courier New"
      Selection.Font.Size = 8
    ElseIf InStr(1, parameter, "caption ") = 1 Then
      style = "caption"
    ElseIf parameter = "image" Then
      Dim filename
      filename = Selection.text
      Selection.InlineShapes.AddPicture filename:=filename, LinkToFile:=False, SaveWithDocument:=True
    Else
      style = parameter
    End If
    If Len(style) > 0 Then
      On Error GoTo cantApplyStyle
      Selection.style = ActiveDocument.Styles(style)
      On Error GoTo 0
    End If
    Exit Sub
cantApplyStyle:
    MsgBox "Can't apply style '" & style & "'" & vbCrLf & Err.Description
  End If
End Sub

Sub md2word()
  Dim commands
  If Len(Selection.text) > 1 Then
    commands = Split(Selection.text, vbCr)
  Else
    Dim request As Object
    Set request = CreateObject("MSXML2.XMLHTTP")
    request.Open "GET", "http://localhost:53475/script?ts=" + CStr(Now), False
    request.Send
    commands = Split(request.ResponseText, vbLf)
  End If
  Dim command
  For Each command In commands
    Call dispatch(command)
  Next command
End Sub

