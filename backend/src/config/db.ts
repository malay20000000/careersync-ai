import mongoose from 'mongoose';

// Dynamic in-memory mock store for fallback mode
const memoryDb: { [modelName: string]: any[] } = {};

function setupMongooseMock() {
  console.warn('\n⚠️  WARNING: Falling back to in-memory database mock. Data will NOT persist across restarts!');

  // Override connection state to make mongoose think it is connected
  (mongoose.connection as any).readyState = 1;

  const originalModel = mongoose.model.bind(mongoose);

  // Patch Model prototype for instance methods (e.g. document.save())
  const ModelProto = mongoose.Model.prototype as any;
  ModelProto.save = async function(this: any) {
    const modelName = this.constructor.modelName;
    if (!memoryDb[modelName]) {
      memoryDb[modelName] = [];
    }

    if (!this._id) {
      this._id = new mongoose.Types.ObjectId().toString();
    }

    const docData = this.toObject();
    const index = memoryDb[modelName].findIndex((d: any) => d._id.toString() === this._id.toString());
    if (index >= 0) {
      memoryDb[modelName][index] = docData;
    } else {
      memoryDb[modelName].push(docData);
    }
    return this;
  };

  const patchModelMethods = (modelClass: any) => {
    const name = modelClass.modelName;
    if (!memoryDb[name]) {
      memoryDb[name] = [];
    }

    modelClass.find = function(filter: any) {
      let results = [...(memoryDb[name] || [])];
      if (filter && typeof filter === 'object') {
        results = results.filter((item: any) => {
          for (const key in filter) {
            if (filter[key] && typeof filter[key] === 'object' && filter[key].$in) {
              if (!filter[key].$in.includes(item[key])) return false;
            } else if (item[key] !== filter[key]) {
              return false;
            }
          }
          return true;
        });
      }
      const q = {
        exec: async () => results,
        then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
        select: function() { return this; },
        sort: function() { return this; }
      };
      return q;
    };

    modelClass.findOne = function(filter: any) {
      let results = [...(memoryDb[name] || [])];
      if (filter && typeof filter === 'object') {
        results = results.filter((item: any) => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      }
      const found = results[0] || null;
      const doc = found ? new modelClass(found) : null;
      if (doc) {
        doc.isNew = false;
      }
      const q = {
        exec: async () => doc,
        then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
        select: function() { return this; }
      };
      return q;
    };

    modelClass.findById = function(id: any) {
      if (!id) {
        const q = {
          exec: async () => null,
          then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
          select: function() { return this; }
        };
        return q;
      }
      const results = memoryDb[name] || [];
      const found = results.find((item: any) => item._id.toString() === id.toString()) || null;
      const doc = found ? new modelClass(found) : null;
      if (doc) {
        doc.isNew = false;
      }
      const q = {
        exec: async () => doc,
        then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); },
        select: function() { return this; }
      };
      return q;
    };

    modelClass.findByIdAndUpdate = function(id: any, update: any, options: any) {
      const results = memoryDb[name] || [];
      const foundIndex = results.findIndex((item: any) => item._id.toString() === id.toString());
      if (foundIndex >= 0) {
        // If updating with mongoose operators (like $set), handle it simplified
        const actualUpdate = update.$set ? { ...update, ...update.$set } : update;
        delete actualUpdate.$set;
        
        const updated = { ...results[foundIndex], ...actualUpdate };
        results[foundIndex] = updated;
        const doc = new modelClass(updated);
        doc.isNew = false;
        const q = {
          exec: async () => doc,
          then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); }
        };
        return q;
      }
      const q = {
        exec: async () => null,
        then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); }
      };
      return q;
    };

    modelClass.findByIdAndDelete = function(id: any) {
      const results = memoryDb[name] || [];
      const foundIndex = results.findIndex((item: any) => item._id.toString() === id.toString());
      let deleted = null;
      if (foundIndex >= 0) {
        deleted = results.splice(foundIndex, 1)[0];
      }
      const q = {
        exec: async () => deleted,
        then: function(resolve: any, reject: any) { return this.exec().then(resolve, reject); }
      };
      return q;
    };
  };

  // Override model compiling to automatically patch future models
  mongoose.model = function(this: any, name: string, schema: any, collection?: string) {
    const modelClass = originalModel(name, schema, collection);
    patchModelMethods(modelClass);
    return modelClass;
  } as any;

  // Also patch any already compiled models
  for (const modelName of mongoose.modelNames()) {
    const modelClass = mongoose.model(modelName);
    patchModelMethods(modelClass);
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careersync');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    setupMongooseMock();
  }
};

export default connectDB;
