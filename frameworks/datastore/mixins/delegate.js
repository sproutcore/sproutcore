// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2011 Junction Networks
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  The data source delegate that provides the implementation
  for it's registered record type(s). All unknown properties
  will be proxied to to the parent data source.

  Mix {@link SC.DataSourceDelegate} into a {@link SC.DataSource}
  of your choice.

  @since 1.7
 */
SC.DataSourceDelegate = {

  /**
    An array of record types that are either extensions of
    `SC.Record` or are strings that reference the absolute
    paths to the record.

    @default 'SC.Record'
    @type String|String[]|SC.Record|SC.Record[]
   */
  isDelegateFor: 'SC.Record',

  /**
    The parent data source.

    This will be set by the owning {@link SC.MultiplexedDataSource}
    when instantiating this delegate.

    @default null
    @type SC.MultiplexedDataSource
   */
  dataSource: null,

  /**
    Proxies all unknownProperties to the parent data source.
    This allows all shared properties to be in a central location.

    If this the parent dataSource is also a {@link SC.DataSourceDelegate},
    and it's an unknown property there too, it will query until it reaches
    the root `dataSource`, then bottom out.
   */
  unknownProperty: function (key, value) {
    if (arguments.length === 2) {
      this.setPath('dataSource.' + key, value);
    }
    return SC.get(this.get('dataSource'), key);
  }
};
