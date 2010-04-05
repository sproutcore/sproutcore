/*globals TestControls Forms*/
TestControls.progressPage = SC.View.design({
  childViews: "form".w(),
  form: Forms.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    
    childViews: "header normal".w(),
    
    // Plain Views
    header: SC.LabelView.design({
      layout: { width: 150, height: 18 },
      value: "Progress Bars",
      className: "header".w()
    }),
    
    // RAW
    normal: SC.FormRowView.design({
      // rowDelegate: automatically calculated because parent.isRowDelegate
      label: "Normal", // Also, FormView can set this automatically by going over childViews.
      
      childViews: "progress".w(), // this is what makes this rather tedious...
      progress: SC.ProgressView.design({
        layout: { height: 20, width: 200 },
        value: 0.25
      })
    }) /*,
    
    // Helper
    disabled: SC.FormView.row("Normal", SC.ProgressView.design({
      layout: { height: 20, width: 200 },
      isEnabled: NO      
    }))*/
  })
});